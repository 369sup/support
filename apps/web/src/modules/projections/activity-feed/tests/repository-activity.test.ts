import { expect, it } from "vitest";

import { InMemoryActivityFeedAdapter } from "../adapters/outbound/persistence/in-memory-activity-feed.adapter";
import { ListRepositoryActivityHandler } from "../application/queries/list-repository-activity.handler";

it("orders repository activity newest first", async () => {
  const result = await new ListRepositoryActivityHandler(
    new InMemoryActivityFeedAdapter(),
  ).listRepositoryActivity("repository_support");
  expect(result).toMatchObject({ status: "found" });
  if (result.status === "found") {
    expect(result.items[0]?.activityId).toBe("activity_comment_1");
  }
});
