import type {
  ListTeamMembersQuery,
  ListTeamMembersResult,
  ListTeamMembersUseCase,
} from "../ports/inbound/list-team-members.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class ListTeamMembersHandler implements ListTeamMembersUseCase {
  private readonly service: OrganizationTeamService;

  constructor(service: OrganizationTeamService) {
    this.service = service;
  }

  listTeamMembers(
    query: ListTeamMembersQuery,
  ): Promise<ListTeamMembersResult> {
    return this.service.listMembers(query);
  }
}
