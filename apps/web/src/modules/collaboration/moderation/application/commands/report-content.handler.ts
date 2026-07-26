import type { ContentReport } from "../../domain/content-report";
import type {
  ReportContentCommand,
  ReportContentResult,
  ReportContentUseCase,
} from "../ports/inbound/report-content.use-case";
import type { ContentReportRepositoryPort } from "../ports/outbound/content-report.repository.port";

export class ReportContentHandler implements ReportContentUseCase {
  private readonly reports: ContentReportRepositoryPort;

  constructor(reports: ContentReportRepositoryPort) {
    this.reports = reports;
  }

  async reportContent(
    command: ReportContentCommand,
  ): Promise<ReportContentResult> {
    if (
      command.reporterAccountId.trim().length === 0 ||
      command.targetId.trim().length === 0
    ) {
      return { status: "invalid-report" };
    }

    if (
      await this.reports.hasOpenReport(
        command.reporterAccountId,
        command.targetKind,
        command.targetId,
      )
    ) {
      return { status: "duplicate-report" };
    }

    const report: ContentReport = {
      reportId: await this.reports.nextReportId(),
      reporterAccountId: command.reporterAccountId,
      targetKind: command.targetKind,
      targetId: command.targetId,
      reason: command.reason,
      status: "open",
      createdAt: command.createdAt,
    };
    await this.reports.insert(report);
    return { status: "reported", report };
  }
}
