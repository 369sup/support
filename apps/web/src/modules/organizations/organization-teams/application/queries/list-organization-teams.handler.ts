import type {
  ListOrganizationTeamsQuery,
  ListOrganizationTeamsResult,
  ListOrganizationTeamsUseCase,
} from "../ports/inbound/list-organization-teams.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class ListOrganizationTeamsHandler
  implements ListOrganizationTeamsUseCase
{
  constructor(private readonly service: OrganizationTeamService) {}

  listOrganizationTeams(
    query: ListOrganizationTeamsQuery,
  ): Promise<ListOrganizationTeamsResult> {
    return this.service.list(query);
  }
}
