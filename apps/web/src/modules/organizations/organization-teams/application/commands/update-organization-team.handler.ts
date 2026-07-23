import type {
  UpdateOrganizationTeamCommand,
  UpdateOrganizationTeamResult,
  UpdateOrganizationTeamUseCase,
} from "../ports/inbound/update-organization-team.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class UpdateOrganizationTeamHandler
  implements UpdateOrganizationTeamUseCase
{
  constructor(private readonly service: OrganizationTeamService) {}

  updateOrganizationTeam(
    command: UpdateOrganizationTeamCommand,
  ): Promise<UpdateOrganizationTeamResult> {
    return this.service.update(command);
  }
}
