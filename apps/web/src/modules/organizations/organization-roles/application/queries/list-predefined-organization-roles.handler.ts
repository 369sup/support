import type {
  ListPredefinedOrganizationRolesQuery,
  ListPredefinedOrganizationRolesResult,
  ListPredefinedOrganizationRolesUseCase,
} from "../ports/inbound/list-predefined-organization-roles.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class ListPredefinedOrganizationRolesHandler
  implements ListPredefinedOrganizationRolesUseCase
{
  constructor(private readonly service: OrganizationRoleService) {}

  listPredefinedOrganizationRoles(
    query: ListPredefinedOrganizationRolesQuery,
  ): Promise<ListPredefinedOrganizationRolesResult> {
    return this.service.listDefinitions(query);
  }
}
