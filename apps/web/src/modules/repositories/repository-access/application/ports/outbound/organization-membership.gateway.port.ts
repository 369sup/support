export type OrganizationOwnerMembershipSnapshot = Readonly<{
  membershipId: string;
  role: "member" | "owner";
}>;

export interface OrganizationMembershipGatewayPort {
  getActiveMembership(
    accountId: string,
    organizationId: string,
  ): Promise<OrganizationOwnerMembershipSnapshot | null>;
}
