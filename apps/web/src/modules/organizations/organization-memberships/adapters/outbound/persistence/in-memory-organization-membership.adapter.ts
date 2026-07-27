import type {
  EnterpriseTeamOrganizationMembershipSynchronization,
  OrganizationMembershipQueryRepositoryPort,
} from "../../../application/ports/outbound/organization-membership-query.repository.port";
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
  membershipIdsByEnterpriseAssignment: Map<string, string[]>;
  enterpriseAssignmentIdsByMembershipId: Map<string, string[]>;
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
    membershipIdsByEnterpriseAssignment: new Map(),
    enterpriseAssignmentIdsByMembershipId: new Map(),
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

function cloneStringArrayMap(
  source: Map<string, string[]>,
): Map<string, string[]> {
  return new Map(
    [...source.entries()].map(([key, values]) => [key, [...values]]),
  );
}

function cloneStore(
  source: OrganizationMembershipStore,
): OrganizationMembershipStore {
  return {
    membershipById: new Map(source.membershipById),
    membershipIdByAccountAndOrganization: new Map(
      source.membershipIdByAccountAndOrganization,
    ),
    membershipIdsByAccount: cloneStringArrayMap(
      source.membershipIdsByAccount,
    ),
    membershipIdsByOrganization: cloneStringArrayMap(
      source.membershipIdsByOrganization,
    ),
    invitationById: new Map(source.invitationById),
    invitationIdsByAccount: cloneStringArrayMap(
      source.invitationIdsByAccount,
    ),
    invitationIdsByOrganization: cloneStringArrayMap(
      source.invitationIdsByOrganization,
    ),
    latestInvitationIdByAccountAndOrganization: new Map(
      source.latestInvitationIdByAccountAndOrganization,
    ),
    membershipIdsByEnterpriseAssignment: cloneStringArrayMap(
      source.membershipIdsByEnterpriseAssignment,
    ),
    enterpriseAssignmentIdsByMembershipId: cloneStringArrayMap(
      source.enterpriseAssignmentIdsByMembershipId,
    ),
  };
}

function replaceStore(
  target: OrganizationMembershipStore,
  source: OrganizationMembershipStore,
): void {
  target.membershipById = source.membershipById;
  target.membershipIdByAccountAndOrganization =
    source.membershipIdByAccountAndOrganization;
  target.membershipIdsByAccount = source.membershipIdsByAccount;
  target.membershipIdsByOrganization =
    source.membershipIdsByOrganization;
  target.invitationById = source.invitationById;
  target.invitationIdsByAccount = source.invitationIdsByAccount;
  target.invitationIdsByOrganization =
    source.invitationIdsByOrganization;
  target.latestInvitationIdByAccountAndOrganization =
    source.latestInvitationIdByAccountAndOrganization;
  target.membershipIdsByEnterpriseAssignment =
    source.membershipIdsByEnterpriseAssignment;
  target.enterpriseAssignmentIdsByMembershipId =
    source.enterpriseAssignmentIdsByMembershipId;
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

  synchronizeEnterpriseTeamAssignment(
    synchronization: EnterpriseTeamOrganizationMembershipSynchronization,
  ): Promise<readonly OrganizationMembershipReference[]> {
    const nextStore = cloneStore(this.store);
    const generatedMembershipIdByAccount = new Map(
      synchronization.generatedMembershipIds.map((entry) => [
        entry.accountId,
        entry.membershipId,
      ]),
    );
    const desiredMembershipIds = synchronization.accountIds.map(
      (accountId) => {
        const membershipKey = compoundKey(
          accountId,
          synchronization.organizationId,
        );
        const existingMembershipId =
          nextStore.membershipIdByAccountAndOrganization.get(membershipKey);
        const membershipId =
          existingMembershipId ??
          generatedMembershipIdByAccount.get(accountId);
        if (membershipId === undefined) {
          throw new Error(
            "Enterprise assignment is missing a generated membership ID.",
          );
        }
        const existingMembership =
          nextStore.membershipById.get(membershipId);
        const shouldPreserveActiveSource =
          existingMembership?.state === "active" &&
          existingMembership.source !== "enterprise-managed";
        const membership = shouldPreserveActiveSource
          ? existingMembership
          : {
              membershipId,
              organizationId: synchronization.organizationId,
              accountId,
              role: "member" as const,
              state: "active" as const,
              source: "enterprise-managed" as const,
            };
        writeMembership(nextStore, membership);
        appendUnique(
          nextStore.enterpriseAssignmentIdsByMembershipId,
          membershipId,
          synchronization.assignmentId,
        );
        cancelPendingInvitation(
          nextStore,
          accountId,
          synchronization.organizationId,
          synchronization.decidedAt,
        );
        return membershipId;
      },
    );
    const desiredMembershipIdSet = new Set(desiredMembershipIds);
    const previousMembershipIds =
      nextStore.membershipIdsByEnterpriseAssignment.get(
        synchronization.assignmentId,
      ) ?? [];
    for (const membershipId of previousMembershipIds) {
      if (desiredMembershipIdSet.has(membershipId)) {
        continue;
      }
      const remainingAssignmentIds = (
        nextStore.enterpriseAssignmentIdsByMembershipId.get(membershipId) ??
        []
      ).filter(
        (assignmentId) =>
          assignmentId !== synchronization.assignmentId,
      );
      if (remainingAssignmentIds.length === 0) {
        nextStore.enterpriseAssignmentIdsByMembershipId.delete(membershipId);
        const membership = nextStore.membershipById.get(membershipId);
        if (membership?.source === "enterprise-managed") {
          writeMembership(nextStore, {
            ...membership,
            state: "removed",
          });
        }
      } else {
        nextStore.enterpriseAssignmentIdsByMembershipId.set(
          membershipId,
          remainingAssignmentIds,
        );
      }
    }
    nextStore.membershipIdsByEnterpriseAssignment.set(
      synchronization.assignmentId,
      desiredMembershipIds,
    );
    replaceStore(this.store, nextStore);
    return Promise.resolve(
      desiredMembershipIds.flatMap((membershipId) => {
        const membership = this.store.membershipById.get(membershipId);
        return membership === undefined ? [] : [membership];
      }),
    );
  }
}

function cancelPendingInvitation(
  store: OrganizationMembershipStore,
  accountId: string,
  organizationId: string,
  decidedAt: string,
): void {
  const invitationId =
    store.latestInvitationIdByAccountAndOrganization.get(
      compoundKey(accountId, organizationId),
    );
  if (invitationId === undefined) {
    return;
  }
  const invitation = store.invitationById.get(invitationId);
  if (invitation?.state !== "pending") {
    return;
  }
  writeInvitation(store, {
    ...invitation,
    state: "canceled",
    decidedAt,
  });
}
