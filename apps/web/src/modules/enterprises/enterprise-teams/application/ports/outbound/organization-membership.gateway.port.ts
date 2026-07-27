export type EnterpriseTeamOrganizationMembershipReference = Readonly<{
  membershipId: string;
  organizationId: string;
  accountId: string;
  role: "member" | "owner";
  state: "active" | "pending" | "suspended" | "removed";
  source: "direct" | "enterprise-managed" | "identity-provider-group";
}>;

export interface OrganizationMembershipGatewayPort {
  synchronizeEnterpriseTeamAssignment(input: {
    assignmentId: string;
    organizationId: string;
    accountIds: readonly string[];
  }): Promise<readonly EnterpriseTeamOrganizationMembershipReference[]>;
}
