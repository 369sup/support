import { expect, it } from "vitest";

import { InMemoryRepositoryStarAdapter } from "../adapters/outbound/persistence/in-memory-repository-star.adapter";
import { ToggleRepositoryStarHandler } from "../application/commands/toggle-repository-star.handler";

it("toggles a repository star", async () => {
  const handler = new ToggleRepositoryStarHandler(
    new InMemoryRepositoryStarAdapter(new Map()),
  );
  await expect(
    handler.toggleRepositoryStar({
      repositoryId: "repository_test",
      actorAccountId: "account_test",
      actorUsername: "test",
      changedAt: "2026-07-26T00:00:00.000Z",
    }),
  ).resolves.toEqual({ status: "updated", isStarred: true });
});
