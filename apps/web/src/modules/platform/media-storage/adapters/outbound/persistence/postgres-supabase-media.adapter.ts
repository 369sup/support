import "server-only";

import type { SupabaseStorageGateway } from "@support/supabase/storage";
import {
  type SqlExecutor,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { MediaObjectRepositoryPort } from "../../../application/ports/outbound/media-object.repository.port";
import type { MediaObject } from "../../../domain/media-object";

type MediaRow = SqlRow & {
  byte_length: number;
  checksum: string;
  classification: MediaObject["classification"];
  content_type: string;
  created_at: Date | string;
  deleted_at: Date | string | null;
  media_id: string;
  state: MediaObject["state"];
  storage_bucket: string;
  storage_key: string;
  version: number;
};

type PendingRemovalRow = SqlRow & {
  operation_id: string;
  storage_bucket: string;
  storage_key: string;
};

const mediaColumns = `
  media_id,
  storage_bucket,
  storage_key,
  byte_length,
  checksum,
  classification,
  content_type,
  state,
  version,
  created_at,
  deleted_at
`;

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export class PostgresSupabaseMediaAdapter
  implements MediaObjectRepositoryPort
{
  private readonly bucket: string;
  private readonly database: TransactionalSqlExecutor;
  private readonly ready: Promise<void>;
  private readonly storage: SupabaseStorageGateway;

  constructor(input: {
    bucket: string;
    database: TransactionalSqlExecutor;
    storage: SupabaseStorageGateway;
  }) {
    this.bucket = input.bucket;
    this.database = input.database;
    this.storage = input.storage;
    this.ready = this.reconcilePendingRemovals();
  }

  async findById(mediaId: string): Promise<MediaObject | null> {
    await this.ready;
    const result = await this.database.query<MediaRow>(
      `
        select ${mediaColumns}
        from support_platform_media_storage.support_media_objects
        where media_id = $1
      `,
      [mediaId],
    );
    const row = result.rows[0];
    if (row === undefined) {
      return null;
    }
    let content: Uint8Array = new Uint8Array();
    if (row.state !== "deleted") {
      const download = await this.storage.downloadObject({
        bucket: row.storage_bucket,
        path: row.storage_key,
      });
      if (download.error !== null) {
        throw new Error(`Supabase Storage download failed: ${download.error.code}`);
      }
      content = download.data;
    }
    return {
      mediaId: row.media_id,
      storageKey: row.storage_key,
      byteLength: row.byte_length,
      checksum: row.checksum,
      classification: row.classification,
      contentType: row.content_type,
      state: row.state,
      version: row.version,
      createdAt: toIsoString(row.created_at),
      deletedAt:
        row.deleted_at === null ? null : toIsoString(row.deleted_at),
      content,
    };
  }

  async save(media: MediaObject): Promise<void> {
    await this.ready;
    if (media.version === 1) {
      await this.insert(media);
      return;
    }
    if (media.state === "deleted") {
      await this.markDeleted(media);
      return;
    }
    const result = await this.database.query(
      `
        update support_platform_media_storage.support_media_objects
        set classification = $3,
            content_type = $4,
            state = $5,
            version = $6
        where media_id = $1 and version = $2 and state <> 'deleted'
      `,
      [
        media.mediaId,
        media.version - 1,
        media.classification,
        media.contentType,
        media.state,
        media.version,
      ],
    );
    if (result.rowCount !== 1) {
      throw new Error("Media optimistic concurrency check failed.");
    }
  }

  private async insert(media: MediaObject): Promise<void> {
    const upload = await this.storage.uploadObject({
      bucket: this.bucket,
      path: media.storageKey,
      content: media.content,
      contentType: media.contentType,
    });
    if (upload.error !== null) {
      throw new Error(`Supabase Storage upload failed: ${upload.error.code}`);
    }
    try {
      await this.database.query(
        `
          insert into support_platform_media_storage.support_media_objects (
            media_id,
            storage_bucket,
            storage_key,
            byte_length,
            checksum,
            classification,
            content_type,
            state,
            version,
            created_at,
            deleted_at
          ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          media.mediaId,
          this.bucket,
          media.storageKey,
          media.byteLength,
          media.checksum,
          media.classification,
          media.contentType,
          media.state,
          media.version,
          media.createdAt,
          media.deletedAt,
        ],
      );
    } catch (error) {
      await this.storage.removeObjects(this.bucket, [media.storageKey]);
      throw error;
    }
  }

  private async markDeleted(media: MediaObject): Promise<void> {
    const operationId = await this.database.transaction(
      async (connection) => {
        const updated = await connection.query(
          `
            update support_platform_media_storage.support_media_objects
            set state = 'deleted',
                version = $3,
                deleted_at = $4
            where media_id = $1 and version = $2 and state <> 'deleted'
          `,
          [
            media.mediaId,
            media.version - 1,
            media.version,
            media.deletedAt,
          ],
        );
        if (updated.rowCount !== 1) {
          throw new Error("Media optimistic concurrency check failed.");
        }
        const operation = await connection.query<{ operation_id: string } & SqlRow>(
          `
            insert into support_platform_media_storage.support_media_storage_operations (
              media_id,
              operation,
              storage_bucket,
              storage_key,
              state
            ) values ($1, 'remove', $2, $3, 'pending')
            returning operation_id::text as operation_id
          `,
          [media.mediaId, this.bucket, media.storageKey],
        );
        const row = operation.rows[0];
        if (row === undefined) {
          throw new Error("Unable to record the Storage removal operation.");
        }
        return row.operation_id;
      },
    );
    await this.attemptRemoval(
      this.database,
      operationId,
      this.bucket,
      media.storageKey,
    );
  }

  private async reconcilePendingRemovals(): Promise<void> {
    const result = await this.database.query<PendingRemovalRow>(
      `
        select
          operation_id::text as operation_id,
          storage_bucket,
          storage_key
        from support_platform_media_storage.support_media_storage_operations
        where state = 'pending'
        order by operation_id
        limit 100
      `,
    );
    for (const operation of result.rows) {
      await this.attemptRemoval(
        this.database,
        operation.operation_id,
        operation.storage_bucket,
        operation.storage_key,
      );
    }
  }

  private async attemptRemoval(
    connection: SqlExecutor,
    operationId: string,
    bucket: string,
    storageKey: string,
  ): Promise<void> {
    const removal = await this.storage.removeObjects(bucket, [storageKey]);
    await connection.query(
      `
        update support_platform_media_storage.support_media_storage_operations
        set attempts = attempts + 1,
            state = case when $2 then 'completed' else state end,
            completed_at = case when $2 then now() else completed_at end
        where operation_id = $1
      `,
      [operationId, removal.error === null],
    );
  }
}
