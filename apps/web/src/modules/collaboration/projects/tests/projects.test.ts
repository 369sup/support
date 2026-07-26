import { describe, expect, it } from "vitest";

import { InMemoryProjectAdapter } from "../adapters/outbound/persistence/in-memory-project.adapter";
import { UpdateProjectItemStatusHandler } from "../application/commands/update-project-item-status.handler";

describe("project collaboration", () => {
  it("allows the project owner to update an item status", async () => {
    const project = {
      description: "test",
      items: [{ itemId: "item_1", status: "backlog" as const, title: "Item" }],
      linkedRepositoryIds: ["repository_1"],
      ownerAccountId: "account_1",
      projectId: "project_1",
      state: "open" as const,
      title: "Project",
      updatedAt: "2026-07-27T00:00:00.000Z",
    };
    const result = await new UpdateProjectItemStatusHandler(
      new InMemoryProjectAdapter(new Map([[project.projectId, project]])),
    ).updateProjectItemStatus({
      actorAccountId: "account_1",
      itemId: "item_1",
      projectId: "project_1",
      status: "done",
      updatedAt: "2026-07-27T01:00:00.000Z",
    });

    expect(result).toMatchObject({
      project: { items: [{ status: "done" }] },
      status: "updated",
    });
  });

  it("rejects non-owner updates", async () => {
    const adapter = new InMemoryProjectAdapter(new Map());
    await expect(
      new UpdateProjectItemStatusHandler(adapter).updateProjectItemStatus({
        actorAccountId: "account_2",
        itemId: "item_1",
        projectId: "missing",
        status: "done",
        updatedAt: "2026-07-27T01:00:00.000Z",
      }),
    ).resolves.toEqual({ status: "project-not-found" });
  });
});
