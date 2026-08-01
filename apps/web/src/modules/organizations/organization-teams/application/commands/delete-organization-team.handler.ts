import type {
  DeleteOrganizationTeamCommand,
  DeleteOrganizationTeamResult,
  DeleteOrganizationTeamUseCase,
} from "../ports/inbound/delete-organization-team.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class DeleteOrganizationTeamHandler
  implements DeleteOrganizationTeamUseCase
{
  private readonly service: OrganizationTeamService;

  constructor(service: OrganizationTeamService) {
    this.service = service;
  }

  deleteOrganizationTeam(
    command: DeleteOrganizationTeamCommand,
  ): Promise<DeleteOrganizationTeamResult> {
    return this.service.delete(command);
  }
}
