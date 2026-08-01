import type {
  ListEnterpriseTeamsQuery,
  ListEnterpriseTeamsResult,
  ListEnterpriseTeamsUseCase,
} from "../ports/inbound/list-enterprise-teams.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class ListEnterpriseTeamsHandler
  implements ListEnterpriseTeamsUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  listEnterpriseTeams(
    query: ListEnterpriseTeamsQuery,
  ): Promise<ListEnterpriseTeamsResult> {
    return this.service.list(query);
  }
}
