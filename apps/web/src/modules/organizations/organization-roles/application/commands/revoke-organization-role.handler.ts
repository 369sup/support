import type {
  RevokeOrganizationRoleCommand,
  RevokeOrganizationRoleResult,
  RevokeOrganizationRoleUseCase,
} from "../ports/inbound/revoke-organization-role.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class RevokeOrganizationRoleHandler
  implements RevokeOrganizationRoleUseCase
{
  constructor(private readonly service: OrganizationRoleService) {}

  revokeOrganizationRole(
    command: RevokeOrganizationRoleCommand,
  ): Promise<RevokeOrganizationRoleResult> {
    return this.service.revoke(command);
  }
}
