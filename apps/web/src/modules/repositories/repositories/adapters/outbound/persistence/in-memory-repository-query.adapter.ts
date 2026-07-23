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

export class InMemoryRepositoryQueryAdapter
  implements RepositoryQueryRepositoryPort
{
  private readonly repositories: readonly RepositoryQuerySnapshot[];

  constructor(
    repositories: readonly RepositoryQuerySnapshot[] =
      developmentRepositories,
  ) {
    this.repositories = repositories;
  }

  findByOwnerId(
    ownerId: string,
  ): Promise<readonly RepositoryQuerySnapshot[]> {
    return Promise.resolve(
      this.repositories.filter(
        (repository) => repository.owner.id === ownerId,
      ),
    );
  }
}
