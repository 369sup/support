import type {
  ClaimDueScheduledCommandsCommand,
  ClaimDueScheduledCommandsResult,
  ClaimDueScheduledCommandsUseCase,
} from "../ports/inbound/claim-due-scheduled-commands.use-case";
import type { ScheduledCommandService } from "../services/scheduled-command.service";

export class ClaimDueScheduledCommandsHandler
  implements ClaimDueScheduledCommandsUseCase
{
  private readonly service: ScheduledCommandService;

  constructor(service: ScheduledCommandService) {
    this.service = service;
  }

  claimDueScheduledCommands(
    command: ClaimDueScheduledCommandsCommand,
  ): Promise<ClaimDueScheduledCommandsResult> {
    return this.service.claimDueScheduledCommands(command);
  }
}
