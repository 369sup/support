import "server-only";

import {
  assertPostgresMigrationsApplied,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";
import { z } from "zod";

import type { AuditStorageRepositoryPort } from "../../../application/ports/outbound/audit-storage.repository.port";
import type {
  AuditExportJob,
  AuditStorageRecord,
  RetentionExecution,
} from "../../../domain/audit-storage-record";
import { postgresAuditStorageMigrations } from "./postgres-audit-storage.migrations";

const metadataValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
const auditRecordSchema = z.object({
  action: z.string(),
  actorId: z.string().nullable(),
  metadata: z.record(z.string(), metadataValueSchema),
  occurredAt: z.string(),
  recordId: z.string(),
  scopeId: z.string(),
  scopeKind: z.enum([
    "account",
    "organization",
    "enterprise",
    "repository",
  ]),
  targetId: z.string().nullable(),
  targetKind: z.string().nullable(),
  version: z.literal(1),
});
const auditExportSchema = z.object({
  checksum: z.string(),
  completedAt: z.string(),
  exportId: z.string(),
  recordCount: z.number().int().nonnegative(),
  version: z.literal(1),
});
const retentionExecutionSchema = z.object({
  cutoff: z.string(),
  executionId: z.string(),
  removedCount: z.number().int().nonnegative(),
  version: z.literal(1),
});

type AuditRecordRow = SqlRow & { record: unknown };
type AuditExportRow = SqlRow & { export_record: unknown };
type RetentionExecutionRow = SqlRow & { execution_record: unknown };

export class PostgresAuditStorageAdapter
  implements AuditStorageRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;
  private readonly ready: Promise<void>;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
    this.ready = assertPostgresMigrationsApplied(
      database,
      postgresAuditStorageMigrations,
    );
  }

  async findExport(exportId: string): Promise<AuditExportJob | null> {
    await this.ready;
    const result = await this.database.query<AuditExportRow>(
      `
        select export_record
        from support_audit_exports
        where export_id = $1
      `,
      [exportId],
    );
    const row = result.rows[0];
    return row === undefined
      ? null
      : auditExportSchema.parse(row.export_record);
  }

  async findRecord(recordId: string): Promise<AuditStorageRecord | null> {
    await this.ready;
    const result = await this.database.query<AuditRecordRow>(
      `
        select record
        from support_audit_records
        where record_id = $1
      `,
      [recordId],
    );
    const row = result.rows[0];
    return row === undefined
      ? null
      : auditRecordSchema.parse(row.record);
  }

  async findRetentionExecution(
    executionId: string,
  ): Promise<RetentionExecution | null> {
    await this.ready;
    const result = await this.database.query<RetentionExecutionRow>(
      `
        select execution_record
        from support_audit_retention_executions
        where execution_id = $1
      `,
      [executionId],
    );
    const row = result.rows[0];
    return row === undefined
      ? null
      : retentionExecutionSchema.parse(row.execution_record);
  }

  async listRecords(): Promise<readonly AuditStorageRecord[]> {
    await this.ready;
    const result = await this.database.query<AuditRecordRow>(`
      select record
      from support_audit_records
      order by occurred_at, record_id
    `);
    return result.rows.map((row) => auditRecordSchema.parse(row.record));
  }

  async removeRecordsBefore(cutoff: string): Promise<number> {
    await this.ready;
    const result = await this.database.query(
      `
        delete from support_audit_records
        where occurred_at < $1
      `,
      [cutoff],
    );
    return result.rowCount;
  }

  async saveExport(job: AuditExportJob): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_audit_exports (
          export_id, completed_at, export_record, version
        ) values ($1, $2, $3::jsonb, $4)
        on conflict (export_id) do nothing
      `,
      [
        job.exportId,
        job.completedAt,
        JSON.stringify(job),
        job.version,
      ],
    );
  }

  async saveRecord(record: AuditStorageRecord): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_audit_records (
          record_id, scope_kind, scope_id, actor_id, target_id,
          occurred_at, record, version
        ) values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
        on conflict (record_id) do nothing
      `,
      [
        record.recordId,
        record.scopeKind,
        record.scopeId,
        record.actorId,
        record.targetId,
        record.occurredAt,
        JSON.stringify(record),
        record.version,
      ],
    );
  }

  async saveRetentionExecution(
    execution: RetentionExecution,
  ): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_audit_retention_executions (
          execution_id, cutoff, execution_record, version
        ) values ($1, $2, $3::jsonb, $4)
        on conflict (execution_id) do nothing
      `,
      [
        execution.executionId,
        execution.cutoff,
        JSON.stringify(execution),
        execution.version,
      ],
    );
  }
}
