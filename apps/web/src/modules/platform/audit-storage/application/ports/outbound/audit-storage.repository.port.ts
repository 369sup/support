import type {
  AuditExportJob,
  AuditStorageRecord,
  RetentionExecution,
} from "../../../domain/audit-storage-record";

export interface AuditStorageRepositoryPort {
  findExport(exportId: string): Promise<AuditExportJob | null>;
  findRecord(recordId: string): Promise<AuditStorageRecord | null>;
  findRetentionExecution(
    executionId: string,
  ): Promise<RetentionExecution | null>;
  listRecords(): Promise<readonly AuditStorageRecord[]>;
  removeRecordsBefore(cutoff: string): Promise<number>;
  saveExport(job: AuditExportJob): Promise<void>;
  saveRecord(record: AuditStorageRecord): Promise<void>;
  saveRetentionExecution(execution: RetentionExecution): Promise<void>;
}
