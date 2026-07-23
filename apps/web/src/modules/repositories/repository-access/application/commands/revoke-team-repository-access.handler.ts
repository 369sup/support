import type {
  RevokeTeamRepositoryAccessCommand,
  RevokeTeamRepositoryAccessResult,
  RevokeTeamRepositoryAccessUseCase,
} from "../ports/inbound/revoke-team-repository-access.use-case";
import type { TeamRepositoryAccessService } from "../services/team-repository-access.service";

export class RevokeTeamRepositoryAccessHandler
  implements RevokeTeamRepositoryAccessUseCase
{
  private readonly service: TeamRepositoryAccessService;

  constructor(service: TeamRepositoryAccessService) {
    this.service = service;
  }

  revokeTeamRepositoryAccess(
    command: RevokeTeamRepositoryAccessCommand,
  ): Promise<RevokeTeamRepositoryAccessResult> {
    return this.service.revoke(command);
  }
}
