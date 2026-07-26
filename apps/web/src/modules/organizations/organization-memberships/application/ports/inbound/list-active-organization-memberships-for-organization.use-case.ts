import type { OrganizationMembershipQuerySnapshot } from "../outbound/organization-membership-query.repository.port";

export type ListActiveOrganizationMembershipsForOrganizationQuery = Readonly<{
  organizationId: string;
}>;

export interface ListActiveOrganizationMembershipsForOrganizationUseCase {
  listActiveOrganizationMembershipsForOrganization(
    query: ListActiveOrganizationMembershipsForOrganizationQuery,
  ): Promise<readonly OrganizationMembershipQuerySnapshot[]>;
}
