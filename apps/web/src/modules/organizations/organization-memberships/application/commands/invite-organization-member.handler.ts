import type {
  InviteOrganizationMemberCommand,
  InviteOrganizationMemberResult,
  InviteOrganizationMemberUseCase,
} from "../ports/inbound/invite-organization-member.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class InviteOrganizationMemberHandler
  implements InviteOrganizationMemberUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  inviteOrganizationMember(
    command: InviteOrganizationMemberCommand,
  ): Promise<InviteOrganizationMemberResult> {
    return this.service.invite(command);
  }
}
