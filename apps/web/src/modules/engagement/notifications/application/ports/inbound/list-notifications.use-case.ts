import type { NotificationInboxItem } from "../../../domain/notification-inbox-item";

export type ListNotificationsResult =
  | Readonly<{ status: "found"; notifications: readonly NotificationInboxItem[] }>
  | Readonly<{ status: "invalid-recipient" }>;

export interface ListNotificationsUseCase {
  listNotifications(recipientAccountId: string): Promise<ListNotificationsResult>;
}
