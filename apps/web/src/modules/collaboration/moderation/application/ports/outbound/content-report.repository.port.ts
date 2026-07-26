import type {
  ContentReport,
  ModerationTargetKind,
} from "../../../domain/content-report";

export interface ContentReportRepositoryPort {
  hasOpenReport(
    reporterAccountId: string,
    targetKind: ModerationTargetKind,
    targetId: string,
  ): Promise<boolean>;
  nextReportId(): Promise<string>;
  insert(report: ContentReport): Promise<void>;
}
