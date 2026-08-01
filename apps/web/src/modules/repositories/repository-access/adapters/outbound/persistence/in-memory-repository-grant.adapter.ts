import type {
  RepositoryGrantRepositoryPort,
  RepositoryGrantSnapshot,
} from "../../../application/ports/outbound/repository-grant.repository.port";
import type { TeamRepositoryGrantRepositoryPort } from "../../../application/ports/outbound/team-repository-grant.repository.port";
import type { TeamRepositoryGrantReference } from "../../../contracts/effective-repository-permission-decision";

const developmentGrants: readonly RepositoryGrantSnapshot[] = [
  {
    grantId: "repository_grant_carol_internal_tools_read",
    repositoryId: "repository_acme_platform_internal_tools",
    accountId: "account_carol_acme",
    permission: "read",
    state: "active",
  },
];

const developmentTeamGrants: readonly TeamRepositoryGrantReference[] = [
  {
    grantId: "team_repository_grant_community_docs_handbook_read",
    repositoryId: "repository_community_lab_private_handbook",
    organizationId: "organization_community_lab",
    teamId: "team_community_docs",
    permission: "read",
    state: "active",
  },
];

type RepositoryGrantStore = {
  directById: Map<string, RepositoryGrantSnapshot>;
  directIdsByRepositoryAndAccount: Map<string, string[]>;
  teamById: Map<string, TeamRepositoryGrantReference>;
  teamIdsByRepository: Map<string, string[]>;
  teamIdByRepositoryAndTeam: Map<string, string>;
};

declare global {
  var __supportRepositoryGrantStoreV2: RepositoryGrantStore | undefined;
}

function grantIndexKey(repositoryId: string, subjectId: string) {
  return `${repositoryId}\u0000${subjectId}`;
}

function createStore(
  grants: readonly RepositoryGrantSnapshot[],
  teamGrants: readonly TeamRepositoryGrantReference[],
): RepositoryGrantStore {
  const store: RepositoryGrantStore = {
    directById: new Map(),
    directIdsByRepositoryAndAccount: new Map(),
    teamById: new Map(),
    teamIdsByRepository: new Map(),
    teamIdByRepositoryAndTeam: new Map(),
  };
  for (const grant of grants) {
    store.directById.set(grant.grantId, grant);
    const key = grantIndexKey(grant.repositoryId, grant.accountId);
    store.directIdsByRepositoryAndAccount.set(key, [
      ...(store.directIdsByRepositoryAndAccount.get(key) ?? []),
      grant.grantId,
    ]);
  }
  for (const grant of teamGrants) {
    store.teamById.set(grant.grantId, grant);
    store.teamIdsByRepository.set(grant.repositoryId, [
      ...(store.teamIdsByRepository.get(grant.repositoryId) ?? []),
      grant.grantId,
    ]);
    store.teamIdByRepositoryAndTeam.set(
      grantIndexKey(grant.repositoryId, grant.teamId),
      grant.grantId,
    );
  }
  return store;
}

function getProcessStore() {
  globalThis.__supportRepositoryGrantStoreV2 ??= createStore(
    developmentGrants,
    developmentTeamGrants,
  );
  return globalThis.__supportRepositoryGrantStoreV2;
}

export class InMemoryRepositoryGrantAdapter
  implements RepositoryGrantRepositoryPort, TeamRepositoryGrantRepositoryPort
{
  private readonly store: RepositoryGrantStore;

  constructor(
    grants?: readonly RepositoryGrantSnapshot[],
    teamGrants?: readonly TeamRepositoryGrantReference[],
  ) {
    this.store =
      grants === undefined && teamGrants === undefined
        ? getProcessStore()
        : createStore(grants ?? [], teamGrants ?? []);
  }

  findActiveByRepositoryAndAccount(
    repositoryId: string,
    accountId: string,
  ): Promise<readonly RepositoryGrantSnapshot[]> {
    const grantIds =
      this.store.directIdsByRepositoryAndAccount.get(
        grantIndexKey(repositoryId, accountId),
      ) ?? [];
    return Promise.resolve(
      grantIds.flatMap((grantId) => {
        const grant = this.store.directById.get(grantId);
        return grant?.state === "active" ? [grant] : [];
      }),
    );
  }

  findActiveByRepository(repositoryId: string) {
    return Promise.resolve(
      (this.store.teamIdsByRepository.get(repositoryId) ?? []).flatMap(
        (grantId) => {
          const grant = this.store.teamById.get(grantId);
          return grant?.state === "active" ? [grant] : [];
        },
      ),
    );
  }

  findActiveByRepositoryAndTeam(repositoryId: string, teamId: string) {
    const grantId = this.store.teamIdByRepositoryAndTeam.get(
      grantIndexKey(repositoryId, teamId),
    );
    const grant =
      grantId === undefined ? undefined : this.store.teamById.get(grantId);
    return Promise.resolve(grant?.state === "active" ? grant : null);
  }

  saveTeamGrant(grant: TeamRepositoryGrantReference) {
    const isNew = !this.store.teamById.has(grant.grantId);
    this.store.teamById.set(grant.grantId, grant);
    if (isNew) {
      this.store.teamIdsByRepository.set(grant.repositoryId, [
        ...(this.store.teamIdsByRepository.get(grant.repositoryId) ?? []),
        grant.grantId,
      ]);
    }
    this.store.teamIdByRepositoryAndTeam.set(
      grantIndexKey(grant.repositoryId, grant.teamId),
      grant.grantId,
    );
    return Promise.resolve();
  }
}
