import type { RepositoryStarRepositoryPort } from "../../../application/ports/outbound/repository-star.repository.port";
import type { RepositoryStargazer } from "../../../contracts/repository-star";

type StarStore = Map<string, RepositoryStargazer>;

declare global {
  var __supportRepositoryStarStoreV1: StarStore | undefined;
}

function starKey(repositoryId: string, accountId: string): string {
  return `${repositoryId}:${accountId}`;
}

function getProcessStore(): StarStore {
  globalThis.__supportRepositoryStarStoreV1 ??= new Map([
    [
      starKey("repository_support", "account_octocat"),
      {
        accountId: "account_octocat",
        username: "octocat",
        starredAt: "2026-07-20T08:00:00.000Z",
      },
    ],
  ]);
  return globalThis.__supportRepositoryStarStoreV1;
}

export class InMemoryRepositoryStarAdapter
  implements RepositoryStarRepositoryPort
{
  private readonly stars: StarStore;

  constructor(stars: StarStore = getProcessStore()) {
    this.stars = stars;
  }

  find(
    repositoryId: string,
    accountId: string,
  ): Promise<RepositoryStargazer | null> {
    return Promise.resolve(this.stars.get(starKey(repositoryId, accountId)) ?? null);
  }

  list(repositoryId: string): Promise<readonly RepositoryStargazer[]> {
    return Promise.resolve(
      [...this.stars.entries()]
        .filter(([key]) => key.startsWith(`${repositoryId}:`))
        .map(([, stargazer]) => stargazer),
    );
  }

  insert(repositoryId: string, stargazer: RepositoryStargazer): Promise<void> {
    this.stars.set(starKey(repositoryId, stargazer.accountId), stargazer);
    return Promise.resolve();
  }

  remove(repositoryId: string, accountId: string): Promise<void> {
    this.stars.delete(starKey(repositoryId, accountId));
    return Promise.resolve();
  }
}
