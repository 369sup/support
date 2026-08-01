import { describe, expect, it } from "vitest";

import {
  getRepositoryForViewing,
  listActivePublicRepositoriesForPersonalOwner,
  listVisibleRepositoriesForOwner,
} from "../server-api";

describe("repositories server API", () => {
  it("exposes only the active public development repository", async () => {
    const repositories =
      await listActivePublicRepositoriesForPersonalOwner({
        accountId: "account_octocat",
        username: "octocat",
      });

    expect(repositories).toHaveLength(1);
    expect(repositories[0]).toMatchObject({
      repositoryId: "repository_support",
      ownerUsername: "octocat",
      name: "support",
      visibility: "public",
      lifecycleState: "active",
    });
  });

  it("reuses the composed facade without runtime configuration", async () => {
    const owner = {
      accountId: "account_octocat",
      username: "octocat",
    };
    const [first, second] = await Promise.all([
      listActivePublicRepositoriesForPersonalOwner(owner),
      listActivePublicRepositoriesForPersonalOwner(owner),
    ]);

    expect(first).toEqual(second);
    expect(first).toHaveLength(1);
  });

  it("lists active and archived repositories visible to the owner", async () => {
    const repositories = await listVisibleRepositoriesForOwner({
      actorAccountId: "account_octocat",
      ownerId: "account_octocat",
    });

    expect(repositories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "support",
          lifecycleState: "active",
          permission: "admin",
        }),
        expect.objectContaining({
          name: "private-fixture",
          visibility: "private",
          permission: "admin",
        }),
        expect.objectContaining({
          name: "archived-fixture",
          lifecycleState: "archived",
          permission: "admin",
        }),
      ]),
    );
  });

  it("does not distinguish a denied repository from an absent repository", async () => {
    const [denied, absent] = await Promise.all([
      getRepositoryForViewing({
        actorAccountId: "account_missing",
        ownerId: "account_octocat",
        name: "support",
      }),
      getRepositoryForViewing({
        actorAccountId: "account_octocat",
        ownerId: "account_octocat",
        name: "does-not-exist",
      }),
    ]);

    expect(denied).toEqual({ status: "repository-not-found" });
    expect(absent).toEqual(denied);
  });

  it("returns an archived repository for read-only viewing", async () => {
    await expect(
      getRepositoryForViewing({
        actorAccountId: "account_octocat",
        ownerId: "account_octocat",
        name: "archived-fixture",
      }),
    ).resolves.toMatchObject({
      status: "found",
      repository: {
        lifecycleState: "archived",
        name: "archived-fixture",
      },
    });
  });
});
