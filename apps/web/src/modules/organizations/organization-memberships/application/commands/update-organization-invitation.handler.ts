import type {
  UpdateOrganizationInvitationCommand,
  UpdateOrganizationInvitationResult,
  UpdateOrganizationInvitationUseCase,
} from "../ports/inbound/update-organization-invitation.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class UpdateOrganizationInvitationHandler
  implements UpdateOrganizationInvitationUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  updateOrganizationInvitation(
    command: UpdateOrganizationInvitationCommand,
  ): Promise<UpdateOrganizationInvitationResult> {
    return this.service.updateInvitation(command);
  }
}
