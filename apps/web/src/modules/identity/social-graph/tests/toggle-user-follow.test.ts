import { expect, it } from "vitest";

import { InMemoryUserFollowAdapter } from "../adapters/outbound/persistence/in-memory-user-follow.adapter";
import { ToggleUserFollowHandler } from "../application/commands/toggle-user-follow.handler";

it("prevents self-follow", async () => {
  const handler = new ToggleUserFollowHandler(
    new InMemoryUserFollowAdapter(new Set()),
  );
  await expect(
    handler.toggleUserFollow({
      followerAccountId: "account_test",
      followedAccountId: "account_test",
    }),
  ).resolves.toEqual({ status: "self-follow-not-allowed" });
});
