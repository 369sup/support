import type { EnterpriseTeamRepositoryPort } from "../../../application/ports/outbound/enterprise-team.repository.port";
import type {
  EnterpriseTeamMembershipReference,
  EnterpriseTeamOrganizationGrantReference,
  EnterpriseTeamReference,
} from "../../../contracts/enterprise-team-reference";

export type EnterpriseTeamSeed = Readonly<{
  teams: readonly EnterpriseTeamReference[];
  memberships: readonly EnterpriseTeamMembershipReference[];
  organizationGrants?: readonly EnterpriseTeamOrganizationGrantReference[];
}>;

const developmentEnterpriseTeamSeed: EnterpriseTeamSeed = {
  teams: [
    {
      teamId: "enterprise_team_acme_platform_operations",
      enterpriseId: "enterprise_acme",
      name: "Platform Operations",
      slug: "platform-operations",
      description: "Coordinates platform operations across ACME organizations.",
      lifecycleState: "active",
    },
    {
      teamId: "enterprise_team_acme_audit_review",
      enterpriseId: "enterprise_acme",
      name: "Audit Review",
      slug: "audit-review",
      description: "Reviews enterprise audit activity.",
      lifecycleState: "active",
    },
  ],
  memberships: [
    {
      teamMembershipId:
        "enterprise_team_membership_carol_platform_operations",
      teamId: "enterprise_team_acme_platform_operations",
      enterpriseId: "enterprise_acme",
      accountId: "account_carol_acme",
      state: "active",
    },
    {
      teamMembershipId:
        "enterprise_team_membership_octocat_audit_review",
      teamId: "enterprise_team_acme_audit_review",
      enterpriseId: "enterprise_acme",
      accountId: "account_octocat",
      state: "active",
    },
  ],
};

type EnterpriseTeamStore = {
  byTeamId: Map<string, EnterpriseTeamReference>;
  teamIdByEnterpriseAndSlug: Map<string, string>;
  membershipById: Map<string, EnterpriseTeamMembershipReference>;
  membershipIdByTeamAndAccount: Map<string, string>;
  membershipIdsByTeam: Map<string, string[]>;
  organizationGrantById: Map<string, EnterpriseTeamOrganizationGrantReference>;
  organizationGrantIdByTeamAndOrganization: Map<string, string>;
  organizationGrantIdsByTeam: Map<string, string[]>;
};

declare global {
  var __supportEnterpriseTeamStoreV1: EnterpriseTeamStore | undefined;
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

function createStore(seed: EnterpriseTeamSeed): EnterpriseTeamStore {
  const store: EnterpriseTeamStore = {
    byTeamId: new Map(),
    teamIdByEnterpriseAndSlug: new Map(),
    membershipById: new Map(),
    membershipIdByTeamAndAccount: new Map(),
    membershipIdsByTeam: new Map(),
    organizationGrantById: new Map(),
    organizationGrantIdByTeamAndOrganization: new Map(),
    organizationGrantIdsByTeam: new Map(),
  };
  for (const team of seed.teams) {
    store.byTeamId.set(team.teamId, team);
    store.teamIdByEnterpriseAndSlug.set(
      compoundKey(team.enterpriseId, team.slug),
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
  }
  for (const grant of seed.organizationGrants ?? []) {
    writeOrganizationGrant(store, grant);
  }
  return store;
}

function writeOrganizationGrant(
  store: EnterpriseTeamStore,
  grant: EnterpriseTeamOrganizationGrantReference,
): void {
  store.organizationGrantById.set(grant.grantId, grant);
  store.organizationGrantIdByTeamAndOrganization.set(
    compoundKey(grant.teamId, grant.organizationId),
    grant.grantId,
  );
  appendUnique(
    store.organizationGrantIdsByTeam,
    grant.teamId,
    grant.grantId,
  );
}

function getProcessStore() {
  globalThis.__supportEnterpriseTeamStoreV1 ??= createStore(
    developmentEnterpriseTeamSeed,
  );
  return globalThis.__supportEnterpriseTeamStoreV1;
}

export class InMemoryEnterpriseTeamAdapter
  implements EnterpriseTeamRepositoryPort
{
  private readonly store: EnterpriseTeamStore;

  constructor(seed?: EnterpriseTeamSeed) {
    this.store = seed === undefined ? getProcessStore() : createStore(seed);
  }

  countActiveTeamsByEnterprise(enterpriseId: string) {
    return Promise.resolve(
      [...this.store.byTeamId.values()].filter(
        (team) =>
          team.enterpriseId === enterpriseId &&
          team.lifecycleState === "active",
      ).length,
    );
  }

  findTeamById(teamId: string) {
    return Promise.resolve(this.store.byTeamId.get(teamId) ?? null);
  }

  findTeamByEnterpriseAndSlug(enterpriseId: string, slug: string) {
    const teamId = this.store.teamIdByEnterpriseAndSlug.get(
      compoundKey(enterpriseId, slug),
    );
    return Promise.resolve(
      teamId === undefined ? null : (this.store.byTeamId.get(teamId) ?? null),
    );
  }

  listActiveTeamsByEnterprise(enterpriseId: string, limit: number) {
    return Promise.resolve(
      [...this.store.byTeamId.values()]
        .filter(
          (team) =>
            team.enterpriseId === enterpriseId &&
            team.lifecycleState === "active",
        )
        .sort((left, right) => left.name.localeCompare(right.name))
        .slice(0, limit),
    );
  }

  saveTeam(team: EnterpriseTeamReference) {
    const previous = this.store.byTeamId.get(team.teamId);
    if (previous !== undefined) {
      this.store.teamIdByEnterpriseAndSlug.delete(
        compoundKey(previous.enterpriseId, previous.slug),
      );
    }
    this.store.byTeamId.set(team.teamId, team);
    this.store.teamIdByEnterpriseAndSlug.set(
      compoundKey(team.enterpriseId, team.slug),
      team.teamId,
    );
    return Promise.resolve();
  }

  countActiveMembershipsByTeam(teamId: string) {
    return Promise.resolve(
      (this.store.membershipIdsByTeam.get(teamId) ?? []).filter(
        (membershipId) =>
          this.store.membershipById.get(membershipId)?.state === "active",
      ).length,
    );
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

  listActiveMembershipsByTeam(teamId: string, limit: number) {
    return Promise.resolve(
      (this.store.membershipIdsByTeam.get(teamId) ?? [])
        .flatMap((membershipId) => {
          const membership = this.store.membershipById.get(membershipId);
          return membership?.state === "active" ? [membership] : [];
        })
        .slice(0, limit),
    );
  }

  saveMembership(membership: EnterpriseTeamMembershipReference) {
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
    return Promise.resolve();
  }

  countActiveOrganizationGrantsByTeam(teamId: string) {
    return Promise.resolve(
      (this.store.organizationGrantIdsByTeam.get(teamId) ?? []).filter(
        (grantId) =>
          this.store.organizationGrantById.get(grantId)?.state === "active",
      ).length,
    );
  }

  findActiveOrganizationGrant(teamId: string, organizationId: string) {
    const grantId =
      this.store.organizationGrantIdByTeamAndOrganization.get(
        compoundKey(teamId, organizationId),
      );
    const grant =
      grantId === undefined
        ? undefined
        : this.store.organizationGrantById.get(grantId);
    return Promise.resolve(grant?.state === "active" ? grant : null);
  }

  listActiveOrganizationGrantsByTeam(teamId: string) {
    return Promise.resolve(
      (this.store.organizationGrantIdsByTeam.get(teamId) ?? []).flatMap(
        (grantId) => {
          const grant = this.store.organizationGrantById.get(grantId);
          return grant?.state === "active" ? [grant] : [];
        },
      ),
    );
  }

  saveOrganizationGrant(
    grant: EnterpriseTeamOrganizationGrantReference,
  ) {
    writeOrganizationGrant(this.store, grant);
    return Promise.resolve();
  }
}
