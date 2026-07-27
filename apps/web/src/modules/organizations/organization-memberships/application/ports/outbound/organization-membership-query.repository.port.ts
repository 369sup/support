export type OrganizationMembershipQuerySnapshot = Readonly<{
  membershipId: string;
  organizationId: string;
  accountId: string;
  role: "member" | "owner";
  state: "active" | "pending" | "suspended" | "removed";
  source: "direct" | "enterprise-managed" | "identity-provider-group";
}>;

export type OrganizationInvitationSnapshot = Readonly<{
  invitationId: string;
  membershipId: string;
  organizationId: string;
  accountId: string;
  inviterAccountId: string;
  role: "member" | "owner";
  state: "pending" | "accepted" | "declined" | "canceled" | "expired";
  createdAt: string;
  expiresAt: string;
  decidedAt: string | null;
}>;

export interface OrganizationMembershipQueryRepositoryPort {
  findByAccountId(
    accountId: string,
  ): Promise<readonly OrganizationMembershipQuerySnapshot[]>;
  findByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ): Promise<OrganizationMembershipQuerySnapshot | null>;
  findByOrganizationId(
    organizationId: string,
  ): Promise<readonly OrganizationMembershipQuerySnapshot[]>;
  findByMembershipId(
    membershipId: string,
  ): Promise<OrganizationMembershipQuerySnapshot | null>;
  countActiveOwnersByOrganization(organizationId: string): Promise<number>;
  saveMembership(
    membership: OrganizationMembershipQuerySnapshot,
  ): Promise<void>;
  findInvitationById(
    invitationId: string,
  ): Promise<OrganizationInvitationSnapshot | null>;
  findLatestInvitationByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ): Promise<OrganizationInvitationSnapshot | null>;
  listInvitationsByAccount(
    accountId: string,
  ): Promise<readonly OrganizationInvitationSnapshot[]>;
  listInvitationsByOrganization(
    organizationId: string,
  ): Promise<readonly OrganizationInvitationSnapshot[]>;
  saveInvitationWithMembership(
    invitation: OrganizationInvitationSnapshot,
    membership: OrganizationMembershipQuerySnapshot,
  ): Promise<void>;
}
