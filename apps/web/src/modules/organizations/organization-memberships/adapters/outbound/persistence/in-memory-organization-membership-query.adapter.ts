import type {
  OrganizationMembershipQueryRepositoryPort,
  OrganizationMembershipQuerySnapshot,
} from "../../../application/ports/outbound/organization-membership-query.repository.port";

const developmentMemberships: readonly OrganizationMembershipQuerySnapshot[] = [
  {
    membershipId: "organization_membership_octocat_community_lab",
    organizationId: "organization_community_lab",
    accountId: "account_octocat",
    role: "owner",
    state: "active",
    source: "direct",
  },
  {
    membershipId: "organization_membership_carol_acme_platform",
    organizationId: "organization_acme_platform",
    accountId: "account_carol_acme",
    role: "member",
    state: "active",
    source: "enterprise-managed",
  },
  {
    membershipId: "organization_membership_bob_acme_support",
    organizationId: "organization_acme_support",
    accountId: "account_bob",
    role: "member",
    state: "pending",
    source: "direct",
  },
];

type MembershipStore = Readonly<{
  byAccountId: Map<string, readonly OrganizationMembershipQuerySnapshot[]>;
  byAccountAndOrganization: Map<string, OrganizationMembershipQuerySnapshot>;
}>;

declare global {
  var __supportOrganizationMembershipStoreV1: MembershipStore | undefined;
}

function membershipKey(accountId: string, organizationId: string) {
  return `${accountId}:${organizationId}`;
}

function createStore(
  memberships: readonly OrganizationMembershipQuerySnapshot[],
): MembershipStore {
  const byAccountId = new Map<
    string,
    readonly OrganizationMembershipQuerySnapshot[]
  >();
  const byAccountAndOrganization = new Map<
    string,
    OrganizationMembershipQuerySnapshot
  >();

  for (const membership of memberships) {
    byAccountId.set(membership.accountId, [
      ...(byAccountId.get(membership.accountId) ?? []),
      membership,
    ]);
    byAccountAndOrganization.set(
      membershipKey(membership.accountId, membership.organizationId),
      membership,
    );
  }

  return { byAccountId, byAccountAndOrganization };
}

function getProcessStore(): MembershipStore {
  globalThis.__supportOrganizationMembershipStoreV1 ??= createStore(
    developmentMemberships,
  );
  return globalThis.__supportOrganizationMembershipStoreV1;
}

export class InMemoryOrganizationMembershipQueryAdapter
  implements OrganizationMembershipQueryRepositoryPort
{
  private readonly store: MembershipStore;

  constructor(memberships?: readonly OrganizationMembershipQuerySnapshot[]) {
    this.store =
      memberships === undefined ? getProcessStore() : createStore(memberships);
  }

  findByAccountId(
    accountId: string,
  ): Promise<readonly OrganizationMembershipQuerySnapshot[]> {
    return Promise.resolve(this.store.byAccountId.get(accountId) ?? []);
  }

  findByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ): Promise<OrganizationMembershipQuerySnapshot | null> {
    return Promise.resolve(
      this.store.byAccountAndOrganization.get(
        membershipKey(accountId, organizationId),
      ) ?? null,
    );
  }
}
