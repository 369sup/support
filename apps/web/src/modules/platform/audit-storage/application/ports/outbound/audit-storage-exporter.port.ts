import type { AuditStorageRecord } from "../../../domain/audit-storage-record";

export interface AuditStorageExporterPort {
  checksum(records: readonly AuditStorageRecord[]): string;
}
