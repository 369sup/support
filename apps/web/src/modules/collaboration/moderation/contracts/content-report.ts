export type ModerationTargetKind = "issue" | "comment";
export type ContentReportReason = "abuse" | "spam" | "off-topic";

export type ContentReport = Readonly<{
  reportId: string;
  reporterAccountId: string;
  targetKind: ModerationTargetKind;
  targetId: string;
  reason: ContentReportReason;
  status: "open";
  createdAt: string;
}>;
