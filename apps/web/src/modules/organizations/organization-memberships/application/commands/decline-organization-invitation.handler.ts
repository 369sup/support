import type {
  DeclineOrganizationInvitationCommand,
  DeclineOrganizationInvitationResult,
  DeclineOrganizationInvitationUseCase,
} from "../ports/inbound/decline-organization-invitation.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class DeclineOrganizationInvitationHandler
  implements DeclineOrganizationInvitationUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  declineOrganizationInvitation(
    command: DeclineOrganizationInvitationCommand,
  ): Promise<DeclineOrganizationInvitationResult> {
    return this.service.declineInvitation(command);
  }
}
