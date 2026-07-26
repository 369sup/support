import type { NotificationInboxItem } from "../../../domain/notification-inbox-item";

export interface NotificationRepositoryPort {
  listByRecipient(
    recipientAccountId: string,
  ): Promise<readonly NotificationInboxItem[]>;
  findForRecipient(
    recipientAccountId: string,
    notificationId: string,
  ): Promise<NotificationInboxItem | null>;
  replace(notification: NotificationInboxItem): Promise<void>;
}
