import type {
  SqlExecutor,
  SqlRow,
} from "@support/database/postgres";
import type {
  RepositoryQueryRepositoryPort,
  RepositoryQuerySnapshot,
} from "../../../application/ports/outbound/repository-query.repository.port";

type RepositoryRow = SqlRow & {
  repository_id: string;
  owner_kind: "personal" | "organization";
  owner_id: string;
  owner_username: string;
  name: string;
  description: string;
  homepage: string;
  visibility: "public" | "private" | "internal";
  lifecycle_state: "active" | "archived" | "deleted";
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string | null;
  restore_until: Date | string | null;
};

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function nullableIso(value: Date | string | null): string | null {
  return value === null ? null : iso(value);
}

function mapRow(row: RepositoryRow): RepositoryQuerySnapshot {
  return {
    repositoryId: row.repository_id,
    owner: {
      kind: row.owner_kind,
      id: row.owner_id,
      username: row.owner_username,
    },
    name: row.name,
    description: row.description,
    homepage: row.homepage,
    visibility: row.visibility,
    lifecycleState: row.lifecycle_state,
    version: row.version,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    deletedAt: nullableIso(row.deleted_at),
    restoreUntil: nullableIso(row.restore_until),
  };
}

export class PostgresRepositoryQueryAdapter
  implements RepositoryQueryRepositoryPort
{
  private readonly database: SqlExecutor;
  private readonly isSchemaReady: Promise<void>;

  constructor(database: SqlExecutor) {
    this.database = database;
    this.isSchemaReady = this.assertSchema();
  }

  private async assertSchema(): Promise<void> {
    const result = await this.database.query<{ isReady: boolean }>(
      `select exists (
         select 1 from support_schema_migrations
         where migration_id = 'zz050_repositories_repositories'
       ) as "isReady"`,
    );
    if (result.rows[0]?.isReady !== true) {
      throw new Error("Repository schema is unavailable.");
    }
  }

  async findByOwnerId(
    ownerId: string,
  ): Promise<readonly RepositoryQuerySnapshot[]> {
    await this.isSchemaReady;
    const result = await this.database.query<RepositoryRow>(
      `select repository_id, owner_kind, owner_id, owner_username, name,
              description, homepage, visibility, lifecycle_state, version,
              created_at, updated_at, deleted_at, restore_until
         from support_repositories
        where owner_id = $1
        order by updated_at desc, repository_id`,
      [ownerId],
    );
    return result.rows.map(mapRow);
  }

  async findByOwnerIdAndName(
    ownerId: string,
    name: string,
  ): Promise<RepositoryQuerySnapshot | null> {
    await this.isSchemaReady;
    const result = await this.database.query<RepositoryRow>(
      `select repository_id, owner_kind, owner_id, owner_username, name,
              description, homepage, visibility, lifecycle_state, version,
              created_at, updated_at, deleted_at, restore_until
         from support_repositories
        where owner_id = $1 and normalized_name = lower($2)
        limit 1`,
      [ownerId, name],
    );
    return result.rows[0] === undefined ? null : mapRow(result.rows[0]);
  }

  async save(repository: RepositoryQuerySnapshot): Promise<void> {
    await this.isSchemaReady;
    await this.database.query(
      `insert into support_repositories (
         repository_id, owner_kind, owner_id, owner_username, normalized_name,
         name, description, homepage, visibility, lifecycle_state, version,
         created_at, updated_at, deleted_at, restore_until
       ) values (
         $1, $2, $3, $4, lower($5), $5, $6, $7, $8, $9, $10,
         $11::timestamptz, $12::timestamptz, $13::timestamptz, $14::timestamptz
       )
       on conflict (repository_id) do update set
         owner_kind = excluded.owner_kind,
         owner_id = excluded.owner_id,
         owner_username = excluded.owner_username,
         normalized_name = excluded.normalized_name,
         name = excluded.name,
         description = excluded.description,
         homepage = excluded.homepage,
         visibility = excluded.visibility,
         lifecycle_state = excluded.lifecycle_state,
         version = excluded.version,
         updated_at = excluded.updated_at,
         deleted_at = excluded.deleted_at,
         restore_until = excluded.restore_until`,
      [
        repository.repositoryId,
        repository.owner.kind,
        repository.owner.id,
        repository.owner.username,
        repository.name,
        repository.description,
        repository.homepage,
        repository.visibility,
        repository.lifecycleState,
        repository.version,
        repository.createdAt,
        repository.updatedAt,
        repository.deletedAt,
        repository.restoreUntil,
      ],
    );
  }
}
