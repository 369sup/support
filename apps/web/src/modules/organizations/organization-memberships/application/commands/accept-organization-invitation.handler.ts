import type {
  AcceptOrganizationInvitationCommand,
  AcceptOrganizationInvitationResult,
  AcceptOrganizationInvitationUseCase,
} from "../ports/inbound/accept-organization-invitation.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class AcceptOrganizationInvitationHandler
  implements AcceptOrganizationInvitationUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  acceptOrganizationInvitation(
    command: AcceptOrganizationInvitationCommand,
  ): Promise<AcceptOrganizationInvitationResult> {
    return this.service.acceptInvitation(command);
  }
}
