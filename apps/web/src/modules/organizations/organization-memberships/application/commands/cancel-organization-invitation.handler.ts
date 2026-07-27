import type {
  CancelOrganizationInvitationCommand,
  CancelOrganizationInvitationResult,
  CancelOrganizationInvitationUseCase,
} from "../ports/inbound/cancel-organization-invitation.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class CancelOrganizationInvitationHandler
  implements CancelOrganizationInvitationUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  cancelOrganizationInvitation(
    command: CancelOrganizationInvitationCommand,
  ): Promise<CancelOrganizationInvitationResult> {
    return this.service.cancelInvitation(command);
  }
}
