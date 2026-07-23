import type {
  RepositoryGrantRepositoryPort,
  RepositoryGrantSnapshot,
} from "../../../application/ports/outbound/repository-grant.repository.port";

const developmentGrants: readonly RepositoryGrantSnapshot[] = [
  {
    grantId: "repository_grant_carol_internal_tools_read",
    repositoryId: "repository_acme_platform_internal_tools",
    accountId: "account_carol_acme",
    permission: "read",
    state: "active",
  },
];

type RepositoryGrantStore = Readonly<{
  byId: Map<string, RepositoryGrantSnapshot>;
  idsByRepositoryAndAccount: Map<string, readonly string[]>;
}>;

declare global {
  var __supportRepositoryGrantStoreV1: RepositoryGrantStore | undefined;
}

function grantIndexKey(repositoryId: string, accountId: string) {
  return `${repositoryId}\u0000${accountId}`;
}

function createStore(
  grants: readonly RepositoryGrantSnapshot[],
): RepositoryGrantStore {
  const byId = new Map<string, RepositoryGrantSnapshot>();
  const mutableIdsByRepositoryAndAccount = new Map<string, string[]>();
  for (const grant of grants) {
    byId.set(grant.grantId, grant);
    const key = grantIndexKey(grant.repositoryId, grant.accountId);
    const grantIds = mutableIdsByRepositoryAndAccount.get(key) ?? [];
    grantIds.push(grant.grantId);
    mutableIdsByRepositoryAndAccount.set(key, grantIds);
  }
  return {
    byId,
    idsByRepositoryAndAccount: mutableIdsByRepositoryAndAccount,
  };
}

function getProcessStore(): RepositoryGrantStore {
  globalThis.__supportRepositoryGrantStoreV1 ??= createStore(
    developmentGrants,
  );
  return globalThis.__supportRepositoryGrantStoreV1;
}

export class InMemoryRepositoryGrantAdapter
  implements RepositoryGrantRepositoryPort
{
  private readonly store: RepositoryGrantStore;

  constructor(grants?: readonly RepositoryGrantSnapshot[]) {
    this.store =
      grants === undefined ? getProcessStore() : createStore(grants);
  }

  findActiveByRepositoryAndAccount(
    repositoryId: string,
    accountId: string,
  ): Promise<readonly RepositoryGrantSnapshot[]> {
    const grantIds =
      this.store.idsByRepositoryAndAccount.get(
        grantIndexKey(repositoryId, accountId),
      ) ?? [];
    return Promise.resolve(
      grantIds.flatMap((grantId) => {
        const grant = this.store.byId.get(grantId);
        return grant?.state === "active" ? [grant] : [];
      }),
    );
  }
}
