import type {
  CompleteScheduledCommandCommand,
  CompleteScheduledCommandResult,
  CompleteScheduledCommandUseCase,
} from "../ports/inbound/complete-scheduled-command.use-case";
import type { ScheduledCommandService } from "../services/scheduled-command.service";

export class CompleteScheduledCommandHandler
  implements CompleteScheduledCommandUseCase
{
  private readonly service: ScheduledCommandService;

  constructor(service: ScheduledCommandService) {
    this.service = service;
  }

  completeScheduledCommand(
    command: CompleteScheduledCommandCommand,
  ): Promise<CompleteScheduledCommandResult> {
    return this.service.completeScheduledCommand(command);
  }
}
