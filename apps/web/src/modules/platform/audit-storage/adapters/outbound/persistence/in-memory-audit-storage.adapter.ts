import type { AuditStorageRepositoryPort } from "../../../application/ports/outbound/audit-storage.repository.port";
import type {
  AuditExportJob,
  AuditStorageRecord,
  RetentionExecution,
} from "../../../domain/audit-storage-record";

export interface InMemoryAuditStorageState {
  exportsById: Map<string, AuditExportJob>;
  recordsById: Map<string, AuditStorageRecord>;
  retentionExecutionsById: Map<string, RetentionExecution>;
}

declare global {
  var __supportAuditStorageStateV1: InMemoryAuditStorageState | undefined;
}

function createState(): InMemoryAuditStorageState {
  return {
    exportsById: new Map(),
    recordsById: new Map(),
    retentionExecutionsById: new Map(),
  };
}

function getProcessState() {
  globalThis.__supportAuditStorageStateV1 ??= createState();
  return globalThis.__supportAuditStorageStateV1;
}

export class InMemoryAuditStorageAdapter
  implements AuditStorageRepositoryPort
{
  private readonly state: InMemoryAuditStorageState;

  static createState() {
    return createState();
  }

  constructor(state: InMemoryAuditStorageState = getProcessState()) {
    this.state = state;
  }

  findExport(exportId: string) {
    return Promise.resolve(this.state.exportsById.get(exportId) ?? null);
  }

  findRecord(recordId: string) {
    return Promise.resolve(this.state.recordsById.get(recordId) ?? null);
  }

  findRetentionExecution(executionId: string) {
    return Promise.resolve(
      this.state.retentionExecutionsById.get(executionId) ?? null,
    );
  }

  listRecords() {
    return Promise.resolve([...this.state.recordsById.values()]);
  }

  removeRecordsBefore(cutoff: string) {
    let removedCount = 0;
    for (const [recordId, record] of this.state.recordsById) {
      if (record.occurredAt < cutoff) {
        this.state.recordsById.delete(recordId);
        removedCount += 1;
      }
    }
    return Promise.resolve(removedCount);
  }

  reset() {
    this.state.exportsById.clear();
    this.state.recordsById.clear();
    this.state.retentionExecutionsById.clear();
  }

  saveExport(job: AuditExportJob) {
    this.state.exportsById.set(job.exportId, job);
    return Promise.resolve();
  }

  saveRecord(record: AuditStorageRecord) {
    this.state.recordsById.set(record.recordId, record);
    return Promise.resolve();
  }

  saveRetentionExecution(execution: RetentionExecution) {
    this.state.retentionExecutionsById.set(execution.executionId, execution);
    return Promise.resolve();
  }
}
