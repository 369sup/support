import type {
  FailScheduledCommandCommand,
  FailScheduledCommandResult,
  FailScheduledCommandUseCase,
} from "../ports/inbound/fail-scheduled-command.use-case";
import type { ScheduledCommandService } from "../services/scheduled-command.service";

export class FailScheduledCommandHandler
  implements FailScheduledCommandUseCase
{
  private readonly service: ScheduledCommandService;

  constructor(service: ScheduledCommandService) {
    this.service = service;
  }

  failScheduledCommand(
    command: FailScheduledCommandCommand,
  ): Promise<FailScheduledCommandResult> {
    return this.service.failScheduledCommand(command);
  }
}
