import type {
  RevokeTeamRepositoryAccessCommand,
  RevokeTeamRepositoryAccessResult,
  RevokeTeamRepositoryAccessUseCase,
} from "../ports/inbound/revoke-team-repository-access.use-case";
import type { TeamRepositoryAccessService } from "../services/team-repository-access.service";

export class RevokeTeamRepositoryAccessHandler
  implements RevokeTeamRepositoryAccessUseCase
{
  constructor(private readonly service: TeamRepositoryAccessService) {}

  revokeTeamRepositoryAccess(
    command: RevokeTeamRepositoryAccessCommand,
  ): Promise<RevokeTeamRepositoryAccessResult> {
    return this.service.revoke(command);
  }
}
