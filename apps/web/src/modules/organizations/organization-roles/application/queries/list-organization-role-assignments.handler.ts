import type {
  ListOrganizationRoleAssignmentsQuery,
  ListOrganizationRoleAssignmentsResult,
  ListOrganizationRoleAssignmentsUseCase,
} from "../ports/inbound/list-organization-role-assignments.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class ListOrganizationRoleAssignmentsHandler
  implements ListOrganizationRoleAssignmentsUseCase
{
  private readonly service: OrganizationRoleService;

  constructor(service: OrganizationRoleService) {
    this.service = service;
  }

  listOrganizationRoleAssignments(
    query: ListOrganizationRoleAssignmentsQuery,
  ): Promise<ListOrganizationRoleAssignmentsResult> {
    return this.service.listAssignments(query);
  }
}
