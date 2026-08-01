import type {
  ListPendingOrganizationInvitationsForAccountQuery,
  ListPendingOrganizationInvitationsForAccountResult,
  ListPendingOrganizationInvitationsForAccountUseCase,
} from "../ports/inbound/list-pending-organization-invitations-for-account.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class ListPendingOrganizationInvitationsForAccountHandler
  implements ListPendingOrganizationInvitationsForAccountUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  listPendingOrganizationInvitationsForAccount(
    query: ListPendingOrganizationInvitationsForAccountQuery,
  ): Promise<ListPendingOrganizationInvitationsForAccountResult> {
    return this.service.listPendingForAccount(query);
  }
}
