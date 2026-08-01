import type {
  ScheduleCommandCommand,
  ScheduleCommandResult,
  ScheduleCommandUseCase,
} from "../ports/inbound/schedule-command.use-case";
import type { ScheduledCommandService } from "../services/scheduled-command.service";

export class ScheduleCommandHandler implements ScheduleCommandUseCase {
  private readonly service: ScheduledCommandService;

  constructor(service: ScheduledCommandService) {
    this.service = service;
  }

  scheduleCommand(
    command: ScheduleCommandCommand,
  ): Promise<ScheduleCommandResult> {
    return this.service.scheduleCommand(command);
  }
}
