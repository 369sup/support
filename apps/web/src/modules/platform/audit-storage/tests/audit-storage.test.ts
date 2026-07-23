import { describe, expect, it } from "vitest";

import { InMemoryAuditStorageAdapter } from "../adapters/outbound/persistence/in-memory-audit-storage.adapter";
import { AppendAuditRecordHandler } from "../application/commands/append-audit-record.handler";
import { ApplyAuditRetentionHandler } from "../application/commands/apply-audit-retention.handler";
import { CreateAuditExportHandler } from "../application/commands/create-audit-export.handler";
import { QueryAuditRecordsHandler } from "../application/queries/query-audit-records.handler";

function createHarness() {
  const repository = new InMemoryAuditStorageAdapter(
    InMemoryAuditStorageAdapter.createState(),
  );
  return {
    append: new AppendAuditRecordHandler(repository),
    export: new CreateAuditExportHandler(
      repository,
      { now: () => "2026-07-23T00:00:00.000Z" },
      { checksum: (records) => `checksum_${records.length}` },
      { nextExportId: () => "audit_export_test" },
    ),
    query: new QueryAuditRecordsHandler(repository),
    retention: new ApplyAuditRetentionHandler(repository),
  };
}

const record = {
  action: "team.created",
  actorId: "account_owner",
  metadata: { visibility: "visible" },
  occurredAt: "2026-07-22T00:00:00.000Z",
  recordId: "event_1",
  scopeId: "organization_1",
  scopeKind: "organization" as const,
  targetId: "team_1",
  targetKind: "team",
};

describe("audit storage", () => {
  it("stores idempotent records without accepting secret metadata", async () => {
    const harness = createHarness();
    await expect(harness.append.appendAuditRecord(record)).resolves.toMatchObject(
      { status: "stored" },
    );
    await expect(
      harness.append.appendAuditRecord({
        ...record,
        metadata: { enabled: true, visibility: "visible" },
        recordId: "event_ordered_metadata",
      }),
    ).resolves.toMatchObject({ status: "stored" });
    await expect(
      harness.append.appendAuditRecord({
        ...record,
        metadata: { visibility: "visible", enabled: true },
        recordId: "event_ordered_metadata",
      }),
    ).resolves.toMatchObject({ status: "already-stored" });
    await expect(harness.append.appendAuditRecord(record)).resolves.toMatchObject(
      { status: "already-stored" },
    );
    await expect(
      harness.append.appendAuditRecord({
        ...record,
        recordId: "event_2",
        metadata: { accessToken: "do-not-store" },
      }),
    ).resolves.toEqual({
      status: "sensitive-metadata-key",
      key: "accessToken",
    });
  });

  it("queries, exports, and applies idempotent retention", async () => {
    const harness = createHarness();
    await harness.append.appendAuditRecord(record);
    await expect(
      harness.query.queryAuditRecords({
        scopeId: "organization_1",
        scopeKind: "organization",
      }),
    ).resolves.toMatchObject({ records: [{ recordId: "event_1" }] });
    await expect(
      harness.export.createAuditExport({
        scopeId: "organization_1",
        scopeKind: "organization",
      }),
    ).resolves.toMatchObject({
      status: "completed",
      export: { recordCount: 1, checksum: "checksum_1" },
    });
    await expect(
      harness.retention.applyAuditRetention({
        cutoff: "2026-07-23T00:00:00.000Z",
        executionId: "retention_1",
      }),
    ).resolves.toEqual({ status: "applied", removedCount: 1 });
    await expect(
      harness.retention.applyAuditRetention({
        cutoff: "2026-07-23T00:00:00.000Z",
        executionId: "retention_1",
      }),
    ).resolves.toEqual({ status: "already-applied", removedCount: 1 });
  });
});
