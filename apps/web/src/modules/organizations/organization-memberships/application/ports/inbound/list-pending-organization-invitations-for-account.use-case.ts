import type { OrganizationInvitationSnapshot } from "../outbound/organization-membership-query.repository.port";

export type ListPendingOrganizationInvitationsForAccountQuery = Readonly<{
  actorAccountId: string;
}>;

export type ListPendingOrganizationInvitationsForAccountResult = Readonly<{
  status: "found";
  invitations: readonly OrganizationInvitationSnapshot[];
}>;

export interface ListPendingOrganizationInvitationsForAccountUseCase {
  listPendingOrganizationInvitationsForAccount(
    query: ListPendingOrganizationInvitationsForAccountQuery,
  ): Promise<ListPendingOrganizationInvitationsForAccountResult>;
}
