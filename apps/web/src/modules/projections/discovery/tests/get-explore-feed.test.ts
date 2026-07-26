import { describe, expect, it } from "vitest";

import { InMemoryExploreFeedAdapter } from "../adapters/outbound/persistence/in-memory-explore-feed.adapter";
import { GetExploreFeedHandler } from "../application/queries/get-explore-feed.handler";

describe("get explore feed", () => {
  it("returns only deterministic public cards", async () => {
    const result = await new GetExploreFeedHandler(
      new InMemoryExploreFeedAdapter(),
    ).getExploreFeed();

    expect(result.feed.repositories).toHaveLength(1);
    expect(result.feed.repositories[0]?.href).toBe("/octocat/support");
  });
});
