import { getProductionDatabase } from "../../../../../production-runtime";
import { SystemScheduledCommandClockAdapter } from "../adapters/outbound/system-scheduled-command-clock.adapter";
import { PostgresScheduledCommandAdapter } from "../adapters/outbound/persistence/postgres-scheduled-command.adapter";
import { ClaimDueScheduledCommandsHandler } from "../application/commands/claim-due-scheduled-commands.handler";
import { CompleteScheduledCommandHandler } from "../application/commands/complete-scheduled-command.handler";
import { FailScheduledCommandHandler } from "../application/commands/fail-scheduled-command.handler";
import { ReconcileExpiredCommandLeasesHandler } from "../application/commands/reconcile-expired-command-leases.handler";
import { ScheduleCommandHandler } from "../application/commands/schedule-command.handler";
import { ScheduledCommandService } from "../application/services/scheduled-command.service";

const database = getProductionDatabase();
const repository = new PostgresScheduledCommandAdapter(database);
const service = new ScheduledCommandService(
  repository,
  new SystemScheduledCommandClockAdapter(),
);
const claim = new ClaimDueScheduledCommandsHandler(service);
const complete = new CompleteScheduledCommandHandler(service);
const fail = new FailScheduledCommandHandler(service);
const reconcile = new ReconcileExpiredCommandLeasesHandler(service);
const schedule = new ScheduleCommandHandler(service);

export const scheduledCommandsServerFacade = {
  claimDueScheduledCommands:
    claim.claimDueScheduledCommands.bind(claim),
  completeScheduledCommand:
    complete.completeScheduledCommand.bind(complete),
  failScheduledCommand: fail.failScheduledCommand.bind(fail),
  reconcileExpiredCommandLeases:
    reconcile.reconcileExpiredCommandLeases.bind(reconcile),
  scheduleCommand: schedule.scheduleCommand.bind(schedule),
};
