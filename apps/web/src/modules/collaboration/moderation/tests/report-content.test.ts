import { describe, expect, it } from "vitest";

import { InMemoryContentReportAdapter } from "../adapters/outbound/persistence/in-memory-content-report.adapter";
import { ReportContentHandler } from "../application/commands/report-content.handler";

describe("report content", () => {
  it("rejects a duplicate open report", async () => {
    const reports = new InMemoryContentReportAdapter(new Map());
    const handler = new ReportContentHandler(reports);
    const command = {
      reporterAccountId: "account_mock",
      targetKind: "issue" as const,
      targetId: "issue_1",
      reason: "spam" as const,
      createdAt: "2026-07-26T00:00:00.000Z",
    };

    await expect(handler.reportContent(command)).resolves.toMatchObject({
      status: "reported",
    });
    await expect(handler.reportContent(command)).resolves.toEqual({
      status: "duplicate-report",
    });
  });
});
