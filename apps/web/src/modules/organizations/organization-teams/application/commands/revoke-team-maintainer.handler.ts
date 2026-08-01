import type {
  RevokeTeamMaintainerCommand,
  RevokeTeamMaintainerResult,
  RevokeTeamMaintainerUseCase,
} from "../ports/inbound/revoke-team-maintainer.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class RevokeTeamMaintainerHandler
  implements RevokeTeamMaintainerUseCase
{
  private readonly service: OrganizationTeamService;

  constructor(service: OrganizationTeamService) {
    this.service = service;
  }

  revokeTeamMaintainer(
    command: RevokeTeamMaintainerCommand,
  ): Promise<RevokeTeamMaintainerResult> {
    return this.service.revokeMaintainer(command);
  }
}
