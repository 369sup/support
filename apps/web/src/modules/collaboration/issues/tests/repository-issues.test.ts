import { describe, expect, it } from "vitest";

import { InMemoryIssueAdapter } from "../adapters/outbound/persistence/in-memory-issue.adapter";
import { CreateIssueHandler } from "../application/commands/create-issue.handler";
import { ListRepositoryIssuesHandler } from "../application/queries/list-repository-issues.handler";

describe("repository issues", () => {
  it("creates a repository-scoped open issue", async () => {
    const issues = new InMemoryIssueAdapter(new Map());
    const handler = new CreateIssueHandler(issues);

    await expect(
      handler.createIssue({
        repositoryId: "repository_test",
        actorAccountId: "account_test",
        actorUsername: "test",
        title: " First issue ",
        body: " Track the work ",
        createdAt: "2026-07-26T00:00:00.000Z",
      }),
    ).resolves.toMatchObject({
      status: "created",
      issue: { number: 1, state: "open", title: "First issue" },
    });
  });

  it("lists only the requested issue state", async () => {
    const issues = new InMemoryIssueAdapter();
    const handler = new ListRepositoryIssuesHandler(issues);

    const result = await handler.listRepositoryIssues({
      repositoryId: "repository_support",
      state: "open",
    });
    expect(result).toMatchObject({ status: "found" });
    if (result.status === "found") {
      expect(result.issues.every((issue) => issue.state === "open")).toBe(true);
    }
  });
});
