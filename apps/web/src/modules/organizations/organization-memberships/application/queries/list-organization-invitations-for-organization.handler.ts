import type {
  ListOrganizationInvitationsForOrganizationQuery,
  ListOrganizationInvitationsForOrganizationResult,
  ListOrganizationInvitationsForOrganizationUseCase,
} from "../ports/inbound/list-organization-invitations-for-organization.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class ListOrganizationInvitationsForOrganizationHandler
  implements ListOrganizationInvitationsForOrganizationUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  listOrganizationInvitationsForOrganization(
    query: ListOrganizationInvitationsForOrganizationQuery,
  ): Promise<ListOrganizationInvitationsForOrganizationResult> {
    return this.service.listForOrganization(query);
  }
}
