import type {
  ReconcileExpiredCommandLeasesCommand,
  ReconcileExpiredCommandLeasesResult,
  ReconcileExpiredCommandLeasesUseCase,
} from "../ports/inbound/reconcile-expired-command-leases.use-case";
import type { ScheduledCommandService } from "../services/scheduled-command.service";

export class ReconcileExpiredCommandLeasesHandler
  implements ReconcileExpiredCommandLeasesUseCase
{
  private readonly service: ScheduledCommandService;

  constructor(service: ScheduledCommandService) {
    this.service = service;
  }

  reconcileExpiredCommandLeases(
    command: ReconcileExpiredCommandLeasesCommand,
  ): Promise<ReconcileExpiredCommandLeasesResult> {
    return this.service.reconcileExpiredCommandLeases(command);
  }
}
