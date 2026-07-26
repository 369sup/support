import type {
  ContentReport,
  ContentReportReason,
  ModerationTargetKind,
} from "../../../domain/content-report";

export type ReportContentCommand = Readonly<{
  reporterAccountId: string;
  targetKind: ModerationTargetKind;
  targetId: string;
  reason: ContentReportReason;
  createdAt: string;
}>;

export type ReportContentResult =
  | Readonly<{ status: "reported"; report: ContentReport }>
  | Readonly<{ status: "invalid-report" }>
  | Readonly<{ status: "duplicate-report" }>;

export interface ReportContentUseCase {
  reportContent(command: ReportContentCommand): Promise<ReportContentResult>;
}
