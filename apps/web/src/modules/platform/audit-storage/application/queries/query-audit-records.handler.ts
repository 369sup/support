import type {
  QueryAuditRecordsQuery,
  QueryAuditRecordsResult,
  QueryAuditRecordsUseCase,
} from "../ports/inbound/query-audit-records.use-case";
import type { AuditStorageRepositoryPort } from "../ports/outbound/audit-storage.repository.port";

export class QueryAuditRecordsHandler implements QueryAuditRecordsUseCase {
  private readonly repository: AuditStorageRepositoryPort;

  constructor(repository: AuditStorageRepositoryPort) {
    this.repository = repository;
  }

  async queryAuditRecords(
    query: QueryAuditRecordsQuery,
  ): Promise<QueryAuditRecordsResult> {
    const records = (await this.repository.listRecords())
      .filter(
        (record) =>
          record.scopeKind === query.scopeKind &&
          record.scopeId === query.scopeId,
      )
      .filter(
        (record) =>
          query.actorId === undefined || record.actorId === query.actorId,
      )
      .filter(
        (record) =>
          query.targetId === undefined || record.targetId === query.targetId,
      )
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
      .slice(0, Math.min(500, Math.max(1, query.limit ?? 100)));
    return { status: "found", records };
  }
}
