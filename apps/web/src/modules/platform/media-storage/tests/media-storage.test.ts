import { describe, expect, it } from "vitest";

import { InMemoryMediaObjectAdapter } from "../adapters/outbound/persistence/in-memory-media-object.adapter";
import { DeleteMediaHandler } from "../application/commands/delete-media.handler";
import { QuarantineMediaHandler } from "../application/commands/quarantine-media.handler";
import { StoreMediaHandler } from "../application/commands/store-media.handler";
import { GetMediaReferenceHandler } from "../application/queries/get-media-reference.handler";

function createHarness() {
  const repository = new InMemoryMediaObjectAdapter(
    InMemoryMediaObjectAdapter.createState(),
  );
  const clock = { now: () => "2026-07-23T00:00:00.000Z" };
  return {
    delete: new DeleteMediaHandler(repository, clock),
    get: new GetMediaReferenceHandler(repository),
    quarantine: new QuarantineMediaHandler(repository),
    store: new StoreMediaHandler(
      repository,
      clock,
      { checksum: () => "checksum" },
      {
        nextMediaId: () => "media_test",
        storageKey: (mediaId) => `media/${mediaId}`,
      },
    ),
  };
}

describe("media storage", () => {
  it("stores only metadata in references and supports quarantine", async () => {
    const harness = createHarness();
    const stored = await harness.store.storeMedia({
      classification: "private",
      content: new Uint8Array([1, 2, 3]),
      contentType: "image/png",
    });
    expect(stored.media).not.toHaveProperty("content");
    await expect(
      harness.quarantine.quarantineMedia({
        expectedVersion: 1,
        mediaId: "media_test",
      }),
    ).resolves.toMatchObject({
      status: "quarantined",
      media: { state: "quarantined", version: 2 },
    });
  });

  it("rejects stale deletes and erases content on valid delete", async () => {
    const harness = createHarness();
    await harness.store.storeMedia({
      classification: "sensitive",
      content: new Uint8Array([9]),
      contentType: "application/octet-stream",
    });
    await expect(
      harness.delete.deleteMedia({
        expectedVersion: 0,
        mediaId: "media_test",
      }),
    ).resolves.toEqual({ status: "version-conflict", currentVersion: 1 });
    await expect(
      harness.delete.deleteMedia({
        expectedVersion: 1,
        mediaId: "media_test",
      }),
    ).resolves.toEqual({ status: "deleted" });
    await expect(
      harness.get.getMediaReference({ mediaId: "media_test" }),
    ).resolves.toEqual({ status: "media-not-found" });
  });
});
