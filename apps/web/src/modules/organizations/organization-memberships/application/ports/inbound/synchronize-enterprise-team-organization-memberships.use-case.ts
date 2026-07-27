import type { OrganizationMembershipQuerySnapshot } from "../outbound/organization-membership-query.repository.port";

export type SynchronizeEnterpriseTeamOrganizationMembershipsCommand =
  Readonly<{
    assignmentId: string;
    organizationId: string;
    accountIds: readonly string[];
  }>;

export type SynchronizeEnterpriseTeamOrganizationMembershipsResult =
  Readonly<{
    status: "synchronized";
    memberships: readonly OrganizationMembershipQuerySnapshot[];
  }>;

export interface SynchronizeEnterpriseTeamOrganizationMembershipsUseCase {
  synchronizeEnterpriseTeamOrganizationMemberships(
    command: SynchronizeEnterpriseTeamOrganizationMembershipsCommand,
  ): Promise<SynchronizeEnterpriseTeamOrganizationMembershipsResult>;
}
