import type {
  AssignOrganizationRoleCommand,
  AssignOrganizationRoleResult,
  AssignOrganizationRoleUseCase,
} from "../ports/inbound/assign-organization-role.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class AssignOrganizationRoleHandler
  implements AssignOrganizationRoleUseCase
{
  constructor(private readonly service: OrganizationRoleService) {}

  assignOrganizationRole(
    command: AssignOrganizationRoleCommand,
  ): Promise<AssignOrganizationRoleResult> {
    return this.service.assign(command);
  }
}
