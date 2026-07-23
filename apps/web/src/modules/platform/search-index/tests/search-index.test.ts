import { describe, expect, it } from "vitest";

import { InMemorySearchIndexAdapter } from "../adapters/outbound/persistence/in-memory-search-index.adapter";
import { RemoveSearchDocumentHandler } from "../application/commands/remove-search-document.handler";
import { UpsertSearchDocumentHandler } from "../application/commands/upsert-search-document.handler";
import { QuerySearchIndexHandler } from "../application/queries/query-search-index.handler";

function createHarness() {
  const repository = new InMemorySearchIndexAdapter(
    InMemorySearchIndexAdapter.createState(),
  );
  return {
    query: new QuerySearchIndexHandler(repository),
    remove: new RemoveSearchDocumentHandler(repository),
    upsert: new UpsertSearchDocumentHandler(repository),
  };
}

describe("search index", () => {
  it("upserts versioned documents and returns authorization-key candidates", async () => {
    const harness = createHarness();
    await expect(
      harness.upsert.upsertSearchDocument({
        authorizationKeys: ["organization:community-lab"],
        body: "Public documentation",
        documentId: "repository_docs",
        expectedVersion: null,
        kind: "repository",
        sourceContext: "repositories/repositories",
        sourceVersion: 1,
        title: "Docs",
      }),
    ).resolves.toMatchObject({
      status: "upserted",
      document: { version: 1 },
    });
    await expect(
      harness.query.querySearchIndex({
        authorizationKey: "organization:community-lab",
        query: "docs",
      }),
    ).resolves.toMatchObject({
      candidates: [{ documentId: "repository_docs", score: 3 }],
    });
    await expect(
      harness.query.querySearchIndex({
        authorizationKey: "account:unrelated",
        query: "docs",
      }),
    ).resolves.toEqual({ status: "found", candidates: [] });
  });

  it("rejects stale updates and removals", async () => {
    const harness = createHarness();
    const command = {
      authorizationKeys: [],
      body: "",
      documentId: "document",
      expectedVersion: null,
      kind: "repository",
      sourceContext: "repositories/repositories",
      sourceVersion: 1,
      title: "Repository",
    } as const;
    await harness.upsert.upsertSearchDocument(command);
    await expect(
      harness.upsert.upsertSearchDocument({
        ...command,
        expectedVersion: 0,
      }),
    ).resolves.toEqual({ status: "version-conflict", currentVersion: 1 });
    await expect(
      harness.remove.removeSearchDocument({
        documentId: "document",
        expectedVersion: 0,
      }),
    ).resolves.toEqual({ status: "version-conflict", currentVersion: 1 });
  });
});
