import { InMemoryContentReportAdapter } from "../adapters/outbound/persistence/in-memory-content-report.adapter";
import { ReportContentHandler } from "../application/commands/report-content.handler";
import type { ReportContentUseCase } from "../application/ports/inbound/report-content.use-case";

export type ModerationServerFacade = Readonly<{
  reportContent: ReportContentUseCase["reportContent"];
}>;

function composeModerationServerFacade(): ModerationServerFacade {
  const reportContent = new ReportContentHandler(
    new InMemoryContentReportAdapter(),
  );
  return {
    reportContent: reportContent.reportContent.bind(reportContent),
  };
}

export const moderationServerFacade = composeModerationServerFacade();
