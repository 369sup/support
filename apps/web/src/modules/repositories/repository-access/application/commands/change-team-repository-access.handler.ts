import type {
  ChangeTeamRepositoryAccessCommand,
  ChangeTeamRepositoryAccessResult,
  ChangeTeamRepositoryAccessUseCase,
} from "../ports/inbound/change-team-repository-access.use-case";
import type { TeamRepositoryAccessService } from "../services/team-repository-access.service";

export class ChangeTeamRepositoryAccessHandler
  implements ChangeTeamRepositoryAccessUseCase
{
  private readonly service: TeamRepositoryAccessService;

  constructor(service: TeamRepositoryAccessService) {
    this.service = service;
  }

  changeTeamRepositoryAccess(
    command: ChangeTeamRepositoryAccessCommand,
  ): Promise<ChangeTeamRepositoryAccessResult> {
    return this.service.change(command);
  }
}
