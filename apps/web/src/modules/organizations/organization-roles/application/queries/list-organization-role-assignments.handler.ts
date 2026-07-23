import type {
  ListOrganizationRoleAssignmentsQuery,
  ListOrganizationRoleAssignmentsResult,
  ListOrganizationRoleAssignmentsUseCase,
} from "../ports/inbound/list-organization-role-assignments.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class ListOrganizationRoleAssignmentsHandler
  implements ListOrganizationRoleAssignmentsUseCase
{
  constructor(private readonly service: OrganizationRoleService) {}

  listOrganizationRoleAssignments(
    query: ListOrganizationRoleAssignmentsQuery,
  ): Promise<ListOrganizationRoleAssignmentsResult> {
    return this.service.listAssignments(query);
  }
}
