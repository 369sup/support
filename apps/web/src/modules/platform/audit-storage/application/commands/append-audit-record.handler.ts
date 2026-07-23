import type { AuditStorageRecord } from "../../domain/audit-storage-record";
import type {
  AppendAuditRecordCommand,
  AppendAuditRecordResult,
  AppendAuditRecordUseCase,
} from "../ports/inbound/append-audit-record.use-case";
import type { AuditStorageRepositoryPort } from "../ports/outbound/audit-storage.repository.port";

const sensitiveKeyPattern =
  /authorization|cookie|credential|password|secret|token/iu;

function hasSameMetadata(
  left: AuditStorageRecord["metadata"],
  right: AuditStorageRecord["metadata"],
) {
  const keys = Object.keys(left);
  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => left[key] === right[key])
  );
}

function isSameRecord(
  left: AuditStorageRecord,
  right: AuditStorageRecord,
) {
  return (
    left.action === right.action &&
    left.actorId === right.actorId &&
    left.occurredAt === right.occurredAt &&
    left.recordId === right.recordId &&
    left.scopeId === right.scopeId &&
    left.scopeKind === right.scopeKind &&
    left.targetId === right.targetId &&
    left.targetKind === right.targetKind &&
    hasSameMetadata(left.metadata, right.metadata)
  );
}

export class AppendAuditRecordHandler implements AppendAuditRecordUseCase {
  private readonly repository: AuditStorageRepositoryPort;

  constructor(repository: AuditStorageRepositoryPort) {
    this.repository = repository;
  }

  async appendAuditRecord(
    command: AppendAuditRecordCommand,
  ): Promise<AppendAuditRecordResult> {
    const sensitiveKey = Object.keys(command.metadata).find((key) =>
      sensitiveKeyPattern.test(key),
    );
    if (sensitiveKey !== undefined) {
      return { status: "sensitive-metadata-key", key: sensitiveKey };
    }
    const record: AuditStorageRecord = { ...command, version: 1 };
    const current = await this.repository.findRecord(command.recordId);
    if (current !== null) {
      return isSameRecord(current, record)
        ? { status: "already-stored", record: current }
        : { status: "record-conflict" };
    }
    await this.repository.saveRecord(record);
    return { status: "stored", record };
  }
}
