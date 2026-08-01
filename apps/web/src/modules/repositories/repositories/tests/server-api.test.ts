import { describe, expect, it } from "vitest";

import { listActivePublicRepositoriesForPersonalOwner } from "../server-api";

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
});
