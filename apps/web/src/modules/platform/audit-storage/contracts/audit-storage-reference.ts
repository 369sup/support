export type AuditStorageRecordReference = Readonly<{
  action: string;
  actorId: string | null;
  occurredAt: string;
  recordId: string;
  scopeId: string;
  scopeKind: "account" | "organization" | "enterprise" | "repository";
  targetId: string | null;
  targetKind: string | null;
  version: 1;
}>;

export type AuditExportReference = Readonly<{
  checksum: string;
  completedAt: string;
  exportId: string;
  recordCount: number;
  version: 1;
}>;
