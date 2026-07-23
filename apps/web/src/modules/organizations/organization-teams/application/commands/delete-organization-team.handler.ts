import type {
  DeleteOrganizationTeamCommand,
  DeleteOrganizationTeamResult,
  DeleteOrganizationTeamUseCase,
} from "../ports/inbound/delete-organization-team.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class DeleteOrganizationTeamHandler
  implements DeleteOrganizationTeamUseCase
{
  constructor(private readonly service: OrganizationTeamService) {}

  deleteOrganizationTeam(
    command: DeleteOrganizationTeamCommand,
  ): Promise<DeleteOrganizationTeamResult> {
    return this.service.delete(command);
  }
}
