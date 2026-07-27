import type { OrganizationMembershipQueryRepositoryPort } from "../../../application/ports/outbound/organization-membership-query.repository.port";
import type {
  OrganizationInvitationReference,
  OrganizationMembershipReference,
} from "../../../contracts/organization-membership-reference";

export type OrganizationMembershipSeed = Readonly<{
  invitations?: readonly OrganizationInvitationReference[];
  memberships: readonly OrganizationMembershipReference[];
}>;

const developmentMemberships: readonly OrganizationMembershipReference[] = [
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
    membershipId: "organization_membership_hubot_community_lab",
    organizationId: "organization_community_lab",
    accountId: "account_hubot",
    role: "member",
    state: "active",
    source: "direct",
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

type OrganizationMembershipStore = {
  membershipById: Map<string, OrganizationMembershipReference>;
  membershipIdByAccountAndOrganization: Map<string, string>;
  membershipIdsByAccount: Map<string, string[]>;
  membershipIdsByOrganization: Map<string, string[]>;
  invitationById: Map<string, OrganizationInvitationReference>;
  invitationIdsByAccount: Map<string, string[]>;
  invitationIdsByOrganization: Map<string, string[]>;
  latestInvitationIdByAccountAndOrganization: Map<string, string>;
};

declare global {
  var __supportOrganizationMembershipStoreV2:
    | OrganizationMembershipStore
    | undefined;
}

function compoundKey(...parts: readonly string[]): string {
  return parts.join("\u0000");
}

function appendUnique(
  index: Map<string, string[]>,
  key: string,
  identifier: string,
): void {
  const identifiers = index.get(key) ?? [];
  if (!identifiers.includes(identifier)) {
    index.set(key, [...identifiers, identifier]);
  }
}

function createDevelopmentSeed(): OrganizationMembershipSeed {
  const currentTime = Date.now();
  return {
    memberships: developmentMemberships,
    invitations: [
      {
        invitationId: "organization_invitation_bob_acme_support",
        membershipId: "organization_membership_bob_acme_support",
        organizationId: "organization_acme_support",
        accountId: "account_bob",
        inviterAccountId: "account_alice",
        role: "member",
        state: "pending",
        createdAt: new Date(currentTime - 86_400_000).toISOString(),
        expiresAt: new Date(currentTime + 518_400_000).toISOString(),
        decidedAt: null,
      },
    ],
  };
}

function createStore(
  seed: OrganizationMembershipSeed,
): OrganizationMembershipStore {
  const store: OrganizationMembershipStore = {
    membershipById: new Map(),
    membershipIdByAccountAndOrganization: new Map(),
    membershipIdsByAccount: new Map(),
    membershipIdsByOrganization: new Map(),
    invitationById: new Map(),
    invitationIdsByAccount: new Map(),
    invitationIdsByOrganization: new Map(),
    latestInvitationIdByAccountAndOrganization: new Map(),
  };

  for (const membership of seed.memberships) {
    writeMembership(store, membership);
  }
  for (const invitation of seed.invitations ?? []) {
    writeInvitation(store, invitation);
  }

  return store;
}

function getProcessStore(): OrganizationMembershipStore {
  globalThis.__supportOrganizationMembershipStoreV2 ??= createStore(
    createDevelopmentSeed(),
  );
  return globalThis.__supportOrganizationMembershipStoreV2;
}

function writeMembership(
  store: OrganizationMembershipStore,
  membership: OrganizationMembershipReference,
): void {
  store.membershipById.set(membership.membershipId, membership);
  store.membershipIdByAccountAndOrganization.set(
    compoundKey(membership.accountId, membership.organizationId),
    membership.membershipId,
  );
  appendUnique(
    store.membershipIdsByAccount,
    membership.accountId,
    membership.membershipId,
  );
  appendUnique(
    store.membershipIdsByOrganization,
    membership.organizationId,
    membership.membershipId,
  );
}

function writeInvitation(
  store: OrganizationMembershipStore,
  invitation: OrganizationInvitationReference,
): void {
  store.invitationById.set(invitation.invitationId, invitation);
  store.latestInvitationIdByAccountAndOrganization.set(
    compoundKey(invitation.accountId, invitation.organizationId),
    invitation.invitationId,
  );
  appendUnique(
    store.invitationIdsByAccount,
    invitation.accountId,
    invitation.invitationId,
  );
  appendUnique(
    store.invitationIdsByOrganization,
    invitation.organizationId,
    invitation.invitationId,
  );
}

function selectMemberships(
  store: OrganizationMembershipStore,
  membershipIds: readonly string[],
): readonly OrganizationMembershipReference[] {
  return membershipIds.flatMap((membershipId) => {
    const membership = store.membershipById.get(membershipId);
    return membership === undefined ? [] : [membership];
  });
}

function selectInvitations(
  store: OrganizationMembershipStore,
  invitationIds: readonly string[],
): readonly OrganizationInvitationReference[] {
  return invitationIds.flatMap((invitationId) => {
    const invitation = store.invitationById.get(invitationId);
    return invitation === undefined ? [] : [invitation];
  });
}

export class InMemoryOrganizationMembershipAdapter
  implements OrganizationMembershipQueryRepositoryPort
{
  private readonly store: OrganizationMembershipStore;

  constructor(seed?: OrganizationMembershipSeed) {
    this.store = seed === undefined ? getProcessStore() : createStore(seed);
  }

  findByAccountId(
    accountId: string,
  ): Promise<readonly OrganizationMembershipReference[]> {
    return Promise.resolve(
      selectMemberships(
        this.store,
        this.store.membershipIdsByAccount.get(accountId) ?? [],
      ),
    );
  }

  findByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ): Promise<OrganizationMembershipReference | null> {
    const membershipId =
      this.store.membershipIdByAccountAndOrganization.get(
        compoundKey(accountId, organizationId),
      );
    return Promise.resolve(
      membershipId === undefined
        ? null
        : (this.store.membershipById.get(membershipId) ?? null),
    );
  }

  findByOrganizationId(
    organizationId: string,
  ): Promise<readonly OrganizationMembershipReference[]> {
    return Promise.resolve(
      selectMemberships(
        this.store,
        this.store.membershipIdsByOrganization.get(organizationId) ?? [],
      ),
    );
  }

  findByMembershipId(
    membershipId: string,
  ): Promise<OrganizationMembershipReference | null> {
    return Promise.resolve(this.store.membershipById.get(membershipId) ?? null);
  }

  countActiveOwnersByOrganization(organizationId: string): Promise<number> {
    return Promise.resolve(
      selectMemberships(
        this.store,
        this.store.membershipIdsByOrganization.get(organizationId) ?? [],
      ).filter(
        (membership) =>
          membership.state === "active" && membership.role === "owner",
      ).length,
    );
  }

  saveMembership(membership: OrganizationMembershipReference): Promise<void> {
    writeMembership(this.store, membership);
    return Promise.resolve();
  }

  findInvitationById(
    invitationId: string,
  ): Promise<OrganizationInvitationReference | null> {
    return Promise.resolve(this.store.invitationById.get(invitationId) ?? null);
  }

  findLatestInvitationByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ): Promise<OrganizationInvitationReference | null> {
    const invitationId =
      this.store.latestInvitationIdByAccountAndOrganization.get(
        compoundKey(accountId, organizationId),
      );
    return Promise.resolve(
      invitationId === undefined
        ? null
        : (this.store.invitationById.get(invitationId) ?? null),
    );
  }

  listInvitationsByAccount(
    accountId: string,
  ): Promise<readonly OrganizationInvitationReference[]> {
    return Promise.resolve(
      selectInvitations(
        this.store,
        this.store.invitationIdsByAccount.get(accountId) ?? [],
      ),
    );
  }

  listInvitationsByOrganization(
    organizationId: string,
  ): Promise<readonly OrganizationInvitationReference[]> {
    return Promise.resolve(
      selectInvitations(
        this.store,
        this.store.invitationIdsByOrganization.get(organizationId) ?? [],
      ),
    );
  }

  saveInvitationWithMembership(
    invitation: OrganizationInvitationReference,
    membership: OrganizationMembershipReference,
  ): Promise<void> {
    writeInvitation(this.store, invitation);
    writeMembership(this.store, membership);
    return Promise.resolve();
  }
}
