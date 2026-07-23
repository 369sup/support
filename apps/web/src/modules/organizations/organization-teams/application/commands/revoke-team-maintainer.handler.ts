import type {
  RevokeTeamMaintainerCommand,
  RevokeTeamMaintainerResult,
  RevokeTeamMaintainerUseCase,
} from "../ports/inbound/revoke-team-maintainer.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class RevokeTeamMaintainerHandler
  implements RevokeTeamMaintainerUseCase
{
  constructor(private readonly service: OrganizationTeamService) {}

  revokeTeamMaintainer(
    command: RevokeTeamMaintainerCommand,
  ): Promise<RevokeTeamMaintainerResult> {
    return this.service.revokeMaintainer(command);
  }
}
