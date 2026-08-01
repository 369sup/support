import type {
  AssignOrganizationRoleCommand,
  AssignOrganizationRoleResult,
  AssignOrganizationRoleUseCase,
} from "../ports/inbound/assign-organization-role.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class AssignOrganizationRoleHandler
  implements AssignOrganizationRoleUseCase
{
  private readonly service: OrganizationRoleService;

  constructor(service: OrganizationRoleService) {
    this.service = service;
  }

  assignOrganizationRole(
    command: AssignOrganizationRoleCommand,
  ): Promise<AssignOrganizationRoleResult> {
    return this.service.assign(command);
  }
}
