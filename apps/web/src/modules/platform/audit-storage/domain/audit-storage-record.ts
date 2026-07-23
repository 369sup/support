export type AuditMetadataValue = string | number | boolean | null;

export type AuditStorageRecord = Readonly<{
  action: string;
  actorId: string | null;
  metadata: Readonly<Record<string, AuditMetadataValue>>;
  occurredAt: string;
  recordId: string;
  scopeId: string;
  scopeKind: "account" | "organization" | "enterprise" | "repository";
  targetId: string | null;
  targetKind: string | null;
  version: 1;
}>;

export type AuditExportJob = Readonly<{
  checksum: string;
  completedAt: string;
  exportId: string;
  recordCount: number;
  version: 1;
}>;

export type RetentionExecution = Readonly<{
  cutoff: string;
  executionId: string;
  removedCount: number;
  version: 1;
}>;
