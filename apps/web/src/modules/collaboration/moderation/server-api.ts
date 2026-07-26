import { moderationServerFacade } from "./composition/moderation.composition";

export type {
  ContentReport,
  ContentReportReason,
  ModerationTargetKind,
} from "./contracts/content-report";

export const reportContent = moderationServerFacade.reportContent;
