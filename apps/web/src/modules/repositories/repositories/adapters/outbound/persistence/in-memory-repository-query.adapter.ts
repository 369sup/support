import type {
  RepositoryQueryRepositoryPort,
  RepositoryQuerySnapshot,
} from "../../../application/ports/outbound/repository-query.repository.port";

const developmentRepositories: readonly RepositoryQuerySnapshot[] = [
  {
    repositoryId: "repository_support",
    owner: {
      kind: "personal",
      id: "account_octocat",
      username: "octocat",
    },
    name: "support",
    description: "A non-code GitHub product platform built as a modular monolith.",
    visibility: "public",
    lifecycleState: "active",
    updatedAt: "2026-07-23T00:00:00.000Z",
  },
  {
    repositoryId: "repository_community_lab_docs",
    owner: {
      kind: "organization",
      id: "organization_community_lab",
      username: "community-lab",
    },
    name: "docs",
    description: "Public documentation maintained by Community Lab.",
    visibility: "public",
    lifecycleState: "active",
    updatedAt: "2026-07-23T00:00:00.000Z",
  },
  {
    repositoryId: "repository_community_lab_private_handbook",
    owner: {
      kind: "organization",
      id: "organization_community_lab",
      username: "community-lab",
    },
    name: "private-handbook",
    description: "Private operating handbook for Community Lab teams.",
    visibility: "private",
    lifecycleState: "active",
    updatedAt: "2026-07-23T00:00:00.000Z",
  },
  {
    repositoryId: "repository_acme_platform_internal_tools",
    owner: {
      kind: "organization",
      id: "organization_acme_platform",
      username: "acme-platform",
    },
    name: "internal-tools",
    description: "Internal tools for the ACME Platform organization.",
    visibility: "internal",
    lifecycleState: "active",
    updatedAt: "2026-07-23T00:00:00.000Z",
  },
  {
    repositoryId: "repository_private_fixture",
    owner: {
      kind: "personal",
      id: "account_octocat",
      username: "octocat",
    },
    name: "private-fixture",
    description: "A fixture excluded from the public repository query.",
    visibility: "private",
    lifecycleState: "active",
    updatedAt: "2026-07-22T00:00:00.000Z",
  },
  {
    repositoryId: "repository_archived_fixture",
    owner: {
      kind: "personal",
      id: "account_octocat",
      username: "octocat",
    },
    name: "archived-fixture",
    description: "A fixture excluded from active repository results.",
    visibility: "public",
    lifecycleState: "archived",
    updatedAt: "2026-07-21T00:00:00.000Z",
  },
];

type RepositoryStore = Readonly<{
  byId: Map<string, RepositoryQuerySnapshot>;
  idsByOwnerId: Map<string, readonly string[]>;
  idByOwnerAndName: Map<string, string>;
}>;

declare global {
  var __supportRepositoryStoreV1: RepositoryStore | undefined;
}

function ownerAndNameKey(ownerId: string, name: string) {
  return `${ownerId}\u0000${name}`;
}

function createStore(
  repositories: readonly RepositoryQuerySnapshot[],
): RepositoryStore {
  const byId = new Map<string, RepositoryQuerySnapshot>();
  const mutableIdsByOwnerId = new Map<string, string[]>();
  const idByOwnerAndName = new Map<string, string>();
  for (const repository of repositories) {
    byId.set(repository.repositoryId, repository);
    const ownerIds = mutableIdsByOwnerId.get(repository.owner.id) ?? [];
    ownerIds.push(repository.repositoryId);
    mutableIdsByOwnerId.set(repository.owner.id, ownerIds);
    idByOwnerAndName.set(
      ownerAndNameKey(repository.owner.id, repository.name),
      repository.repositoryId,
    );
  }
  return {
    byId,
    idsByOwnerId: mutableIdsByOwnerId,
    idByOwnerAndName,
  };
}

function getProcessStore(): RepositoryStore {
  globalThis.__supportRepositoryStoreV1 ??= createStore(
    developmentRepositories,
  );
  return globalThis.__supportRepositoryStoreV1;
}

export class InMemoryRepositoryQueryAdapter
  implements RepositoryQueryRepositoryPort
{
  private readonly store: RepositoryStore;

  constructor(
    repositories?: readonly RepositoryQuerySnapshot[],
  ) {
    this.store =
      repositories === undefined
        ? getProcessStore()
        : createStore(repositories);
  }

  findByOwnerId(
    ownerId: string,
  ): Promise<readonly RepositoryQuerySnapshot[]> {
    const repositoryIds = this.store.idsByOwnerId.get(ownerId) ?? [];
    return Promise.resolve(
      repositoryIds.flatMap((repositoryId) => {
        const repository = this.store.byId.get(repositoryId);
        return repository === undefined ? [] : [repository];
      }),
    );
  }

  findByOwnerIdAndName(
    ownerId: string,
    name: string,
  ): Promise<RepositoryQuerySnapshot | null> {
    const repositoryId = this.store.idByOwnerAndName.get(
      ownerAndNameKey(ownerId, name),
    );
    return Promise.resolve(
      repositoryId === undefined
        ? null
        : (this.store.byId.get(repositoryId) ?? null),
    );
  }
}
