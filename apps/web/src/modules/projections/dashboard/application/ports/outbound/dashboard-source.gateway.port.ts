export type DashboardOrganizationMembershipSnapshot = Readonly<{
  membershipId: string;
  organizationId: string;
  role: "member" | "owner";
}>;

export type DashboardOrganizationSnapshot = Readonly<{
  organizationId: string;
  login: string;
  displayName: string;
  lifecycleState: "active" | "suspended" | "deleted";
}>;

export type DashboardRepositoryCandidateSnapshot = Readonly<{
  repositoryId: string;
  ownerLogin: string;
  owner:
    | Readonly<{ kind: "personal"; accountId: string; login: string }>
    | Readonly<{
        kind: "organization";
        organizationId: string;
        login: string;
      }>;
  name: string;
  description: string;
  visibility: "public" | "private" | "internal";
  updatedAt: string;
}>;

export type DashboardRepositoryPermissionSnapshot = Readonly<{
  isAllowed: boolean;
  permission: "read" | "triage" | "write" | "maintain" | "admin" | null;
}>;

export interface DashboardSourceGatewayPort {
  getActiveOrganizationMembership(
    accountId: string,
    organizationId: string,
  ): Promise<DashboardOrganizationMembershipSnapshot | null>;
  getOrganization(
    organizationId: string,
  ): Promise<DashboardOrganizationSnapshot | null>;
  listActiveOrganizationMemberships(
    accountId: string,
  ): Promise<readonly DashboardOrganizationMembershipSnapshot[]>;
  listActiveRepositories(
    ownerId: string,
  ): Promise<readonly DashboardRepositoryCandidateSnapshot[]>;
  resolveRepositoryPermission(
    repository: DashboardRepositoryCandidateSnapshot,
    accountId: string,
  ): Promise<DashboardRepositoryPermissionSnapshot>;
}
