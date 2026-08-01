import type {
  ListOrganizationTeamsQuery,
  ListOrganizationTeamsResult,
  ListOrganizationTeamsUseCase,
} from "../ports/inbound/list-organization-teams.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class ListOrganizationTeamsHandler
  implements ListOrganizationTeamsUseCase
{
  private readonly service: OrganizationTeamService;

  constructor(service: OrganizationTeamService) {
    this.service = service;
  }

  listOrganizationTeams(
    query: ListOrganizationTeamsQuery,
  ): Promise<ListOrganizationTeamsResult> {
    return this.service.list(query);
  }
}
