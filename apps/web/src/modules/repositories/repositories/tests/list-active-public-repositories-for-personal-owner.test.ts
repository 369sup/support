import { describe, expect, it } from "vitest";

import type {
  RepositoryQueryRepositoryPort,
  RepositoryQuerySnapshot,
} from "../application/ports/outbound/repository-query.repository.port";
import { ListActivePublicRepositoriesForPersonalOwnerHandler } from "../application/queries/list-active-public-repositories-for-personal-owner.handler";

class RepositoryQueryRepositoryFake
  implements RepositoryQueryRepositoryPort
{
  private readonly repositories: readonly RepositoryQuerySnapshot[];

  constructor(repositories: readonly RepositoryQuerySnapshot[]) {
    this.repositories = repositories;
  }

  findByOwnerId() {
    return Promise.resolve(this.repositories);
  }
}

const matchingRepository: RepositoryQuerySnapshot = {
  repositoryId: "repository_support",
  owner: {
    kind: "personal",
    id: "account_octocat",
    username: "octocat",
  },
  name: "support",
  description: "Support",
  visibility: "public",
  lifecycleState: "active",
  updatedAt: "2026-07-23T00:00:00.000Z",
};

describe("ListActivePublicRepositoriesForPersonalOwnerHandler", () => {
  it("returns only active public repositories owned by the personal account", async () => {
    const handler =
      new ListActivePublicRepositoriesForPersonalOwnerHandler(
        new RepositoryQueryRepositoryFake([
          matchingRepository,
          {
            ...matchingRepository,
            repositoryId: "repository_private",
            visibility: "private",
          },
          {
            ...matchingRepository,
            repositoryId: "repository_archived",
            lifecycleState: "archived",
          },
          {
            ...matchingRepository,
            repositoryId: "repository_other_owner",
            owner: {
              kind: "personal",
              id: "account_other",
              username: "other",
            },
          },
        ]),
      );

    await expect(
      handler.execute({ ownerAccountId: "account_octocat" }),
    ).resolves.toEqual([matchingRepository]);
  });
});
