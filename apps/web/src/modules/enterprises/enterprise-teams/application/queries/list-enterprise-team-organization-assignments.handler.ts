import type {
  ListEnterpriseTeamOrganizationAssignmentsQuery,
  ListEnterpriseTeamOrganizationAssignmentsResult,
  ListEnterpriseTeamOrganizationAssignmentsUseCase,
} from "../ports/inbound/list-enterprise-team-organization-assignments.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class ListEnterpriseTeamOrganizationAssignmentsHandler
  implements ListEnterpriseTeamOrganizationAssignmentsUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  listEnterpriseTeamOrganizationAssignments(
    query: ListEnterpriseTeamOrganizationAssignmentsQuery,
  ): Promise<ListEnterpriseTeamOrganizationAssignmentsResult> {
    return this.service.listOrganizationAssignments(query);
  }
}
