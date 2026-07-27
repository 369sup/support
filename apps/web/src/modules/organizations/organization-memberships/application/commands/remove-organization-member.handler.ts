import type {
  RemoveOrganizationMemberCommand,
  RemoveOrganizationMemberResult,
  RemoveOrganizationMemberUseCase,
} from "../ports/inbound/remove-organization-member.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class RemoveOrganizationMemberHandler
  implements RemoveOrganizationMemberUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  removeOrganizationMember(
    command: RemoveOrganizationMemberCommand,
  ): Promise<RemoveOrganizationMemberResult> {
    return this.service.removeMember(command);
  }
}
