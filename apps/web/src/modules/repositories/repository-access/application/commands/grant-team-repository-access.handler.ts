import type {
  GrantTeamRepositoryAccessCommand,
  GrantTeamRepositoryAccessResult,
  GrantTeamRepositoryAccessUseCase,
} from "../ports/inbound/grant-team-repository-access.use-case";
import type { TeamRepositoryAccessService } from "../services/team-repository-access.service";

export class GrantTeamRepositoryAccessHandler
  implements GrantTeamRepositoryAccessUseCase
{
  private readonly service: TeamRepositoryAccessService;

  constructor(service: TeamRepositoryAccessService) {
    this.service = service;
  }

  grantTeamRepositoryAccess(
    command: GrantTeamRepositoryAccessCommand,
  ): Promise<GrantTeamRepositoryAccessResult> {
    return this.service.grant(command);
  }
}
