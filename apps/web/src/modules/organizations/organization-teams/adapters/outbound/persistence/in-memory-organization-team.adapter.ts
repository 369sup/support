import type {
  OrganizationTeamRepositoryPort,
} from "../../../application/ports/outbound/organization-team.repository.port";
import type {
  OrganizationTeamReference,
  TeamMaintainerReference,
  TeamMembershipReference,
} from "../../../contracts/organization-team-reference";

export type OrganizationTeamSeed = Readonly<{
  teams: readonly OrganizationTeamReference[];
  memberships: readonly TeamMembershipReference[];
  maintainers: readonly TeamMaintainerReference[];
}>;

const developmentOrganizationTeamSeed: OrganizationTeamSeed = {
  teams: [
    {
      teamId: "team_community_docs",
      organizationId: "organization_community_lab",
      name: "Docs",
      slug: "docs",
      description: "Community Lab documentation maintainers.",
      visibility: "visible",
      parentTeamId: null,
      lifecycleState: "active",
    },
    {
      teamId: "team_community_docs_ops",
      organizationId: "organization_community_lab",
      name: "Docs Operations",
      slug: "docs-ops",
      description: "Automation operators for Community Lab documentation.",
      visibility: "visible",
      parentTeamId: "team_community_docs",
      lifecycleState: "active",
    },
    {
      teamId: "team_community_private",
      organizationId: "organization_community_lab",
      name: "Private Planning",
      slug: "private-planning",
      description: "A secret Community Lab planning team.",
      visibility: "secret",
      parentTeamId: null,
      lifecycleState: "active",
    },
    {
      teamId: "team_acme_platform_engineering",
      organizationId: "organization_acme_platform",
      name: "Platform Engineering",
      slug: "platform-engineering",
      description: "ACME platform engineers.",
      visibility: "visible",
      parentTeamId: null,
      lifecycleState: "active",
    },
  ],
  memberships: [
    {
      teamMembershipId: "team_membership_octocat_community_docs",
      teamId: "team_community_docs",
      organizationId: "organization_community_lab",
      accountId: "account_octocat",
      state: "active",
    },
    {
      teamMembershipId: "team_membership_hubot_community_docs_ops",
      teamId: "team_community_docs_ops",
      organizationId: "organization_community_lab",
      accountId: "account_hubot",
      state: "active",
    },
    {
      teamMembershipId: "team_membership_carol_acme_platform_engineering",
      teamId: "team_acme_platform_engineering",
      organizationId: "organization_acme_platform",
      accountId: "account_carol_acme",
      state: "active",
    },
  ],
  maintainers: [
    {
      teamMaintainerId: "team_maintainer_octocat_community_docs",
      teamId: "team_community_docs",
      organizationId: "organization_community_lab",
      accountId: "account_octocat",
      state: "active",
    },
    {
      teamMaintainerId: "team_maintainer_carol_acme_platform_engineering",
      teamId: "team_acme_platform_engineering",
      organizationId: "organization_acme_platform",
      accountId: "account_carol_acme",
      state: "active",
    },
  ],
};

type OrganizationTeamStore = {
  byTeamId: Map<string, OrganizationTeamReference>;
  teamIdByOrganizationAndSlug: Map<string, string>;
  membershipById: Map<string, TeamMembershipReference>;
  membershipIdByTeamAndAccount: Map<string, string>;
  membershipIdsByTeam: Map<string, string[]>;
  membershipIdsByAccountAndOrganization: Map<string, string[]>;
  maintainerById: Map<string, TeamMaintainerReference>;
  maintainerIdByTeamAndAccount: Map<string, string>;
};

declare global {
  var __supportOrganizationTeamStoreV1: OrganizationTeamStore | undefined;
}

function compoundKey(...parts: readonly string[]) {
  return parts.join("\u0000");
}

function appendUnique(index: Map<string, string[]>, key: string, id: string) {
  const values = index.get(key) ?? [];
  if (!values.includes(id)) {
    index.set(key, [...values, id]);
  }
}

function createStore(seed: OrganizationTeamSeed): OrganizationTeamStore {
  const store: OrganizationTeamStore = {
    byTeamId: new Map(),
    teamIdByOrganizationAndSlug: new Map(),
    membershipById: new Map(),
    membershipIdByTeamAndAccount: new Map(),
    membershipIdsByTeam: new Map(),
    membershipIdsByAccountAndOrganization: new Map(),
    maintainerById: new Map(),
    maintainerIdByTeamAndAccount: new Map(),
  };
  for (const team of seed.teams) {
    store.byTeamId.set(team.teamId, team);
    store.teamIdByOrganizationAndSlug.set(
      compoundKey(team.organizationId, team.slug),
      team.teamId,
    );
  }
  for (const membership of seed.memberships) {
    store.membershipById.set(membership.teamMembershipId, membership);
    store.membershipIdByTeamAndAccount.set(
      compoundKey(membership.teamId, membership.accountId),
      membership.teamMembershipId,
    );
    appendUnique(
      store.membershipIdsByTeam,
      membership.teamId,
      membership.teamMembershipId,
    );
    appendUnique(
      store.membershipIdsByAccountAndOrganization,
      compoundKey(membership.accountId, membership.organizationId),
      membership.teamMembershipId,
    );
  }
  for (const maintainer of seed.maintainers) {
    store.maintainerById.set(maintainer.teamMaintainerId, maintainer);
    store.maintainerIdByTeamAndAccount.set(
      compoundKey(maintainer.teamId, maintainer.accountId),
      maintainer.teamMaintainerId,
    );
  }
  return store;
}

function getProcessStore() {
  globalThis.__supportOrganizationTeamStoreV1 ??= createStore(
    developmentOrganizationTeamSeed,
  );
  return globalThis.__supportOrganizationTeamStoreV1;
}

export class InMemoryOrganizationTeamAdapter
  implements OrganizationTeamRepositoryPort
{
  private readonly store: OrganizationTeamStore;

  constructor(seed?: OrganizationTeamSeed) {
    this.store = seed === undefined ? getProcessStore() : createStore(seed);
  }

  findTeamById(teamId: string) {
    return Promise.resolve(this.store.byTeamId.get(teamId) ?? null);
  }

  findTeamByOrganizationAndSlug(organizationId: string, slug: string) {
    const teamId = this.store.teamIdByOrganizationAndSlug.get(
      compoundKey(organizationId, slug),
    );
    return Promise.resolve(
      teamId === undefined ? null : (this.store.byTeamId.get(teamId) ?? null),
    );
  }

  listTeamsByOrganization(organizationId: string) {
    return Promise.resolve(
      [...this.store.byTeamId.values()].filter(
        (team) => team.organizationId === organizationId,
      ),
    );
  }

  listActiveChildren(teamId: string) {
    return Promise.resolve(
      [...this.store.byTeamId.values()].filter(
        (team) =>
          team.parentTeamId === teamId && team.lifecycleState === "active",
      ),
    );
  }

  saveTeam(team: OrganizationTeamReference) {
    const previous = this.store.byTeamId.get(team.teamId);
    if (previous !== undefined) {
      this.store.teamIdByOrganizationAndSlug.delete(
        compoundKey(previous.organizationId, previous.slug),
      );
    }
    this.store.byTeamId.set(team.teamId, team);
    this.store.teamIdByOrganizationAndSlug.set(
      compoundKey(team.organizationId, team.slug),
      team.teamId,
    );
    return Promise.resolve();
  }

  findActiveMembership(teamId: string, accountId: string) {
    const membershipId = this.store.membershipIdByTeamAndAccount.get(
      compoundKey(teamId, accountId),
    );
    const membership =
      membershipId === undefined
        ? undefined
        : this.store.membershipById.get(membershipId);
    return Promise.resolve(
      membership?.state === "active" ? membership : null,
    );
  }

  listActiveMembershipsByTeam(teamId: string) {
    return Promise.resolve(
      (this.store.membershipIdsByTeam.get(teamId) ?? []).flatMap(
        (membershipId) => {
          const membership = this.store.membershipById.get(membershipId);
          return membership?.state === "active" ? [membership] : [];
        },
      ),
    );
  }

  listActiveMembershipsByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ) {
    return Promise.resolve(
      (
        this.store.membershipIdsByAccountAndOrganization.get(
          compoundKey(accountId, organizationId),
        ) ?? []
      ).flatMap((membershipId) => {
        const membership = this.store.membershipById.get(membershipId);
        return membership?.state === "active" ? [membership] : [];
      }),
    );
  }

  saveMembership(membership: TeamMembershipReference) {
    this.store.membershipById.set(
      membership.teamMembershipId,
      membership,
    );
    this.store.membershipIdByTeamAndAccount.set(
      compoundKey(membership.teamId, membership.accountId),
      membership.teamMembershipId,
    );
    appendUnique(
      this.store.membershipIdsByTeam,
      membership.teamId,
      membership.teamMembershipId,
    );
    appendUnique(
      this.store.membershipIdsByAccountAndOrganization,
      compoundKey(membership.accountId, membership.organizationId),
      membership.teamMembershipId,
    );
    return Promise.resolve();
  }

  findActiveMaintainer(teamId: string, accountId: string) {
    const maintainerId = this.store.maintainerIdByTeamAndAccount.get(
      compoundKey(teamId, accountId),
    );
    const maintainer =
      maintainerId === undefined
        ? undefined
        : this.store.maintainerById.get(maintainerId);
    return Promise.resolve(
      maintainer?.state === "active" ? maintainer : null,
    );
  }

  saveMaintainer(maintainer: TeamMaintainerReference) {
    this.store.maintainerById.set(
      maintainer.teamMaintainerId,
      maintainer,
    );
    this.store.maintainerIdByTeamAndAccount.set(
      compoundKey(maintainer.teamId, maintainer.accountId),
      maintainer.teamMaintainerId,
    );
    return Promise.resolve();
  }
}
