export type OrganizationRoleMembershipSnapshot = Readonly<{
  membershipId: string;
  organizationId: string;
  accountId: string;
  role: "member" | "owner";
}>;

export interface OrganizationMembershipGatewayPort {
  getActiveMembership(
    accountId: string,
    organizationId: string,
  ): Promise<OrganizationRoleMembershipSnapshot | null>;
}
