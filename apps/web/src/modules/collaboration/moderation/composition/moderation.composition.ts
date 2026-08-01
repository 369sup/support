import { getProductionDatabase } from "../../../../../production-runtime";
import { PostgresContentReportAdapter } from "../adapters/outbound/persistence/postgres-content-report.adapter";
import { ReportContentHandler } from "../application/commands/report-content.handler";
import type { ReportContentUseCase } from "../application/ports/inbound/report-content.use-case";

export type ModerationServerFacade = Readonly<{
  reportContent: ReportContentUseCase["reportContent"];
}>;

function composeModerationServerFacade(): ModerationServerFacade {
  const reportContent = new ReportContentHandler(
    new PostgresContentReportAdapter(getProductionDatabase()),
  );
  return {
    reportContent: reportContent.reportContent.bind(reportContent),
  };
}

export const moderationServerFacade = composeModerationServerFacade();
