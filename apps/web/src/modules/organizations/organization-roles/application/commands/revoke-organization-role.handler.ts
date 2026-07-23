import type {
  RevokeOrganizationRoleCommand,
  RevokeOrganizationRoleResult,
  RevokeOrganizationRoleUseCase,
} from "../ports/inbound/revoke-organization-role.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class RevokeOrganizationRoleHandler
  implements RevokeOrganizationRoleUseCase
{
  private readonly service: OrganizationRoleService;

  constructor(service: OrganizationRoleService) {
    this.service = service;
  }

  revokeOrganizationRole(
    command: RevokeOrganizationRoleCommand,
  ): Promise<RevokeOrganizationRoleResult> {
    return this.service.revoke(command);
  }
}
