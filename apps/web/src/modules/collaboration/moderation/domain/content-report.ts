export type ModerationTargetKind = "issue" | "comment";
export type ContentReportReason = "abuse" | "spam" | "off-topic";
export type ContentReport = Readonly<{
  createdAt: string;
  reason: ContentReportReason;
  reporterAccountId: string;
  reportId: string;
  status: "open";
  targetId: string;
  targetKind: ModerationTargetKind;
}>;
