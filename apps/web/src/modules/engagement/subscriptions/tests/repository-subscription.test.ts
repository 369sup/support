import { expect, it } from "vitest";

import { InMemoryRepositorySubscriptionAdapter } from "../adapters/outbound/persistence/in-memory-repository-subscription.adapter";
import { ToggleRepositorySubscriptionHandler } from "../application/commands/toggle-repository-subscription.handler";

it("toggles a repository subscription", async () => {
  const handler = new ToggleRepositorySubscriptionHandler(
    new InMemoryRepositorySubscriptionAdapter(new Map()),
  );
  await expect(
    handler.toggleRepositorySubscription({
      repositoryId: "repository_test",
      actorAccountId: "account_test",
      actorUsername: "test",
      changedAt: "2026-07-26T00:00:00.000Z",
    }),
  ).resolves.toEqual({ status: "updated", isSubscribed: true });
});
