import type {
  ListTeamMembersQuery,
  ListTeamMembersResult,
  ListTeamMembersUseCase,
} from "../ports/inbound/list-team-members.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class ListTeamMembersHandler implements ListTeamMembersUseCase {
  constructor(private readonly service: OrganizationTeamService) {}

  listTeamMembers(
    query: ListTeamMembersQuery,
  ): Promise<ListTeamMembersResult> {
    return this.service.listMembers(query);
  }
}
