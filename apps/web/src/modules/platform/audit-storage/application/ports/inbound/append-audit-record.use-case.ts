import type {
  AuditMetadataValue,
  AuditStorageRecord,
} from "../../../domain/audit-storage-record";

export type AppendAuditRecordCommand = Readonly<{
  action: string;
  actorId: string | null;
  metadata: Readonly<Record<string, AuditMetadataValue>>;
  occurredAt: string;
  recordId: string;
  scopeId: string;
  scopeKind: "account" | "organization" | "enterprise" | "repository";
  targetId: string | null;
  targetKind: string | null;
}>;

export type AppendAuditRecordResult =
  | Readonly<{ status: "stored"; record: AuditStorageRecord }>
  | Readonly<{ status: "already-stored"; record: AuditStorageRecord }>
  | Readonly<{ status: "record-conflict" }>
  | Readonly<{ status: "sensitive-metadata-key"; key: string }>;

export interface AppendAuditRecordUseCase {
  appendAuditRecord(
    command: AppendAuditRecordCommand,
  ): Promise<AppendAuditRecordResult>;
}
