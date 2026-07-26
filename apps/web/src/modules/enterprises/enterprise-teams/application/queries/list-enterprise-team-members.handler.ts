import type {
  ListEnterpriseTeamMembersQuery,
  ListEnterpriseTeamMembersResult,
  ListEnterpriseTeamMembersUseCase,
} from "../ports/inbound/list-enterprise-team-members.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class ListEnterpriseTeamMembersHandler
  implements ListEnterpriseTeamMembersUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  listEnterpriseTeamMembers(
    query: ListEnterpriseTeamMembersQuery,
  ): Promise<ListEnterpriseTeamMembersResult> {
    return this.service.listMembers(query);
  }
}
