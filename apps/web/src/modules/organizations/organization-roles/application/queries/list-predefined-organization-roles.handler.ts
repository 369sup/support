import type {
  ListPredefinedOrganizationRolesQuery,
  ListPredefinedOrganizationRolesResult,
  ListPredefinedOrganizationRolesUseCase,
} from "../ports/inbound/list-predefined-organization-roles.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class ListPredefinedOrganizationRolesHandler
  implements ListPredefinedOrganizationRolesUseCase
{
  private readonly service: OrganizationRoleService;

  constructor(service: OrganizationRoleService) {
    this.service = service;
  }

  listPredefinedOrganizationRoles(
    query: ListPredefinedOrganizationRolesQuery,
  ): Promise<ListPredefinedOrganizationRolesResult> {
    return this.service.listDefinitions(query);
  }
}
