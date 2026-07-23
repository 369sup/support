import type {
  ApplyAuditRetentionCommand,
  ApplyAuditRetentionResult,
  ApplyAuditRetentionUseCase,
} from "../ports/inbound/apply-audit-retention.use-case";
import type { AuditStorageRepositoryPort } from "../ports/outbound/audit-storage.repository.port";

export class ApplyAuditRetentionHandler
  implements ApplyAuditRetentionUseCase
{
  private readonly repository: AuditStorageRepositoryPort;

  constructor(repository: AuditStorageRepositoryPort) {
    this.repository = repository;
  }

  async applyAuditRetention(
    command: ApplyAuditRetentionCommand,
  ): Promise<ApplyAuditRetentionResult> {
    const current = await this.repository.findRetentionExecution(
      command.executionId,
    );
    if (current !== null) {
      return current.cutoff === command.cutoff
        ? {
            status: "already-applied",
            removedCount: current.removedCount,
          }
        : { status: "execution-conflict" };
    }
    const removedCount = await this.repository.removeRecordsBefore(
      command.cutoff,
    );
    await this.repository.saveRetentionExecution({
      cutoff: command.cutoff,
      executionId: command.executionId,
      removedCount,
      version: 1,
    });
    return { status: "applied", removedCount };
  }
}
