export type OrganizationMembershipReference = Readonly<{
  membershipId: string;
  organizationId: string;
  accountId: string;
  role: "member" | "owner";
  state: "active" | "pending" | "suspended" | "removed";
  source: "direct" | "enterprise-managed" | "identity-provider-group";
}>;

export type OrganizationContextEligibilityResult =
  | Readonly<{
      status: "eligible";
      membership: OrganizationMembershipReference;
    }>
  | Readonly<{ status: "context-not-available" }>;
