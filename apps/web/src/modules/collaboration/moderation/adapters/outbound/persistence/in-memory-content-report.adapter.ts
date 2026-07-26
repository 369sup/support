import type { ContentReportRepositoryPort } from "../../../application/ports/outbound/content-report.repository.port";
import type {
  ContentReport,
  ModerationTargetKind,
} from "../../../contracts/content-report";

type ContentReportStore = Map<string, ContentReport>;

declare global {
  var __supportContentReportStoreV1: Map<string, ContentReport> | undefined;
}

function getProcessStore(): Map<string, ContentReport> {
  globalThis.__supportContentReportStoreV1 ??= new Map();
  return globalThis.__supportContentReportStoreV1;
}

export class InMemoryContentReportAdapter
  implements ContentReportRepositoryPort
{
  private readonly reports: ContentReportStore;

  constructor(reports: ContentReportStore = getProcessStore()) {
    this.reports = reports;
  }

  hasOpenReport(
    reporterAccountId: string,
    targetKind: ModerationTargetKind,
    targetId: string,
  ): Promise<boolean> {
    return Promise.resolve(
      [...this.reports.values()].some(
        (report) =>
          report.reporterAccountId === reporterAccountId &&
          report.targetKind === targetKind &&
          report.targetId === targetId,
      ),
    );
  }

  nextReportId(): Promise<string> {
    return Promise.resolve(`report_${this.reports.size + 1}`);
  }

  insert(report: ContentReport): Promise<void> {
    this.reports.set(report.reportId, report);
    return Promise.resolve();
  }
}
