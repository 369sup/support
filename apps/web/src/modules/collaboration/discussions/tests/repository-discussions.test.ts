import { describe, expect, it } from "vitest";

import { InMemoryDiscussionAdapter } from "../adapters/outbound/persistence/in-memory-discussion.adapter";
import { CreateDiscussionHandler } from "../application/commands/create-discussion.handler";
import { GetRepositoryDiscussionHandler } from "../application/queries/get-repository-discussion.handler";

describe("repository discussions", () => {
  it("creates and reads a discussion", async () => {
    const adapter = new InMemoryDiscussionAdapter(new Map());
    const created = await new CreateDiscussionHandler(adapter).createDiscussion({
      actorAccountId: "account_1",
      actorUsername: "alice",
      body: "A useful question",
      category: "q-and-a",
      createdAt: "2026-07-27T01:00:00.000Z",
      repositoryId: "repository_1",
      title: "How should this work?",
    });

    expect(created.status).toBe("created");
    await expect(
      new GetRepositoryDiscussionHandler(adapter).getRepositoryDiscussion({
        number: 1,
        repositoryId: "repository_1",
      }),
    ).resolves.toMatchObject({ status: "found" });
  });
});
