import type { OrganizationInvitationSnapshot } from "../outbound/organization-membership-query.repository.port";

export type ListOrganizationInvitationsForOrganizationQuery = Readonly<{
  actorAccountId: string;
  organizationId: string;
}>;

export type ListOrganizationInvitationsForOrganizationResult =
  | Readonly<{
      status: "found";
      invitations: readonly OrganizationInvitationSnapshot[];
    }>
  | Readonly<{ status: "permission-denied" }>;

export interface ListOrganizationInvitationsForOrganizationUseCase {
  listOrganizationInvitationsForOrganization(
    query: ListOrganizationInvitationsForOrganizationQuery,
  ): Promise<ListOrganizationInvitationsForOrganizationResult>;
}
