import type { AuditStorageRecord } from "../../../domain/audit-storage-record";

export type QueryAuditRecordsQuery = Readonly<{
  actorId?: string;
  limit?: number;
  scopeId: string;
  scopeKind: "account" | "organization" | "enterprise" | "repository";
  targetId?: string;
}>;

export type QueryAuditRecordsResult = Readonly<{
  status: "found";
  records: readonly AuditStorageRecord[];
}>;

export interface QueryAuditRecordsUseCase {
  queryAuditRecords(
    query: QueryAuditRecordsQuery,
  ): Promise<QueryAuditRecordsResult>;
}
