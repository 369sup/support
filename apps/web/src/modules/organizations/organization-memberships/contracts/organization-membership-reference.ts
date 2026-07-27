export type OrganizationMembershipRole = "member" | "owner";

export type OrganizationMembershipSource =
  | "direct"
  | "enterprise-managed"
  | "identity-provider-group";

export type OrganizationMembershipReference = Readonly<{
  membershipId: string;
  organizationId: string;
  accountId: string;
  role: OrganizationMembershipRole;
  state: "active" | "pending" | "suspended" | "removed";
  source: OrganizationMembershipSource;
}>;

export type OrganizationInvitationReference = Readonly<{
  invitationId: string;
  membershipId: string;
  organizationId: string;
  accountId: string;
  inviterAccountId: string;
  role: OrganizationMembershipRole;
  state: "pending" | "accepted" | "declined" | "canceled" | "expired";
  createdAt: string;
  expiresAt: string;
  decidedAt: string | null;
}>;

export type OrganizationContextEligibilityResult =
  | Readonly<{
      status: "eligible";
      membership: OrganizationMembershipReference;
    }>
  | Readonly<{ status: "context-not-available" }>;
