import type {
  ChangeTeamRepositoryAccessCommand,
  ChangeTeamRepositoryAccessResult,
  ChangeTeamRepositoryAccessUseCase,
} from "../ports/inbound/change-team-repository-access.use-case";
import type { TeamRepositoryAccessService } from "../services/team-repository-access.service";

export class ChangeTeamRepositoryAccessHandler
  implements ChangeTeamRepositoryAccessUseCase
{
  constructor(private readonly service: TeamRepositoryAccessService) {}

  changeTeamRepositoryAccess(
    command: ChangeTeamRepositoryAccessCommand,
  ): Promise<ChangeTeamRepositoryAccessResult> {
    return this.service.change(command);
  }
}
