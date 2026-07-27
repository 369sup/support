import type {
  ChangeOrganizationMemberRoleCommand,
  ChangeOrganizationMemberRoleResult,
  ChangeOrganizationMemberRoleUseCase,
} from "../ports/inbound/change-organization-member-role.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class ChangeOrganizationMemberRoleHandler
  implements ChangeOrganizationMemberRoleUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  changeOrganizationMemberRole(
    command: ChangeOrganizationMemberRoleCommand,
  ): Promise<ChangeOrganizationMemberRoleResult> {
    return this.service.changeRole(command);
  }
}
