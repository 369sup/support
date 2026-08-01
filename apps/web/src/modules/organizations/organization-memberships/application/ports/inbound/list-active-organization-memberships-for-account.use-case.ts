import type { OrganizationMembershipQuerySnapshot } from "../outbound/organization-membership-query.repository.port";

export type ListActiveOrganizationMembershipsForAccountQuery = Readonly<{
  accountId: string;
}>;

export interface ListActiveOrganizationMembershipsForAccountUseCase {
  listActiveOrganizationMembershipsForAccount(
    query: ListActiveOrganizationMembershipsForAccountQuery,
  ): Promise<readonly OrganizationMembershipQuerySnapshot[]>;
}
