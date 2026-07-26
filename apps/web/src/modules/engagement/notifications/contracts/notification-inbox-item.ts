export type NotificationReason = "subscribed" | "mention" | "participating";
export type NotificationState = "unread" | "read";

export type NotificationInboxItem = Readonly<{
  notificationId: string;
  recipientAccountId: string;
  repositoryId: string;
  repositoryLabel: string;
  subjectLabel: string;
  subjectHref: string;
  reason: NotificationReason;
  state: NotificationState;
  updatedAt: string;
}>;
