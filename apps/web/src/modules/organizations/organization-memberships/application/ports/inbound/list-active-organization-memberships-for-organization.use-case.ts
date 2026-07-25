import type { OrganizationMembershipReference } from "../../../contracts/organization-membership-reference";

export type ListActiveOrganizationMembershipsForOrganizationQuery = Readonly<{
  organizationId: string;
}>;

export interface ListActiveOrganizationMembershipsForOrganizationUseCase {
  listActiveOrganizationMembershipsForOrganization(
    query: ListActiveOrganizationMembershipsForOrganizationQuery,
  ): Promise<readonly OrganizationMembershipReference[]>;
}
