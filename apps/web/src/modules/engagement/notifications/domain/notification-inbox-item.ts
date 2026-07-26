export type NotificationReason = "subscribed" | "mention" | "participating";
export type NotificationState = "unread" | "read";
export type NotificationInboxItem = Readonly<{
  notificationId: string;
  reason: NotificationReason;
  recipientAccountId: string;
  repositoryId: string;
  repositoryLabel: string;
  state: NotificationState;
  subjectHref: string;
  subjectLabel: string;
  updatedAt: string;
}>;
