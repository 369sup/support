import { describe, expect, it } from "vitest";

import { InMemoryConversationAdapter } from "../adapters/outbound/persistence/in-memory-conversation.adapter";
import { AddCommentHandler } from "../application/commands/add-comment.handler";
import { AddReactionHandler } from "../application/commands/add-reaction.handler";

describe("issue conversation", () => {
  it("adds a non-empty comment", async () => {
    const handler = new AddCommentHandler(new InMemoryConversationAdapter());
    await expect(
      handler.addComment({
        subjectKind: "issue",
        subjectId: "repository_support_issue_2",
        actorAccountId: "account_mock",
        actorUsername: "mock",
        body: " Keep this boundary explicit. ",
        createdAt: "2026-07-26T00:00:00.000Z",
      }),
    ).resolves.toMatchObject({
      status: "added",
      comment: { body: "Keep this boundary explicit." },
    });
  });

  it("rejects a duplicate reaction", async () => {
    const handler = new AddReactionHandler(new InMemoryConversationAdapter());
    await expect(
      handler.addReaction({
        subjectId: "repository_support_issue_1",
        commentId: "comment_1",
        actorAccountId: "account_octocat",
        reaction: "thumbs-up",
      }),
    ).resolves.toEqual({ status: "duplicate-reaction" });
  });
});
