export type OrganizationMembershipQuerySnapshot = Readonly<{
  membershipId: string;
  organizationId: string;
  accountId: string;
  role: "member" | "owner";
  state: "active" | "pending" | "suspended" | "removed";
  source: "direct" | "enterprise-managed" | "identity-provider-group";
}>;

export interface OrganizationMembershipQueryRepositoryPort {
  findByAccountId(
    accountId: string,
  ): Promise<readonly OrganizationMembershipQuerySnapshot[]>;
  findByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ): Promise<OrganizationMembershipQuerySnapshot | null>;
}
