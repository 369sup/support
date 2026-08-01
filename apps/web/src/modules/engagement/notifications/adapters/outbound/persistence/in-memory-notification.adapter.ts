import type { NotificationRepositoryPort } from "../../../application/ports/outbound/notification.repository.port";
import type { NotificationInboxItem } from "../../../contracts/notification-inbox-item";

type NotificationStore = Map<string, NotificationInboxItem>;

declare global {
  var __supportNotificationStoreV1:
    | Map<string, NotificationInboxItem>
    | undefined;
}

function getProcessStore(): Map<string, NotificationInboxItem> {
  globalThis.__supportNotificationStoreV1 ??= new Map([
    [
      "notification_issue_comment",
      {
        notificationId: "notification_issue_comment",
        recipientAccountId: "account_mock",
        repositoryId: "repository_support",
        repositoryLabel: "octocat/support",
        subjectLabel: "Design the contributor notification inbox",
        subjectHref: "/octocat/support/issues/1",
        reason: "participating",
        state: "unread",
        updatedAt: "2026-07-24T11:00:00.000Z",
      },
    ],
    [
      "notification_issue_mention",
      {
        notificationId: "notification_issue_mention",
        recipientAccountId: "account_mock",
        repositoryId: "repository_support",
        repositoryLabel: "octocat/support",
        subjectLabel: "Document the non-code product boundary",
        subjectHref: "/octocat/support/issues/2",
        reason: "mention",
        state: "read",
        updatedAt: "2026-07-23T09:00:00.000Z",
      },
    ],
  ]);
  return globalThis.__supportNotificationStoreV1;
}

export class InMemoryNotificationAdapter
  implements NotificationRepositoryPort
{
  private readonly notifications: NotificationStore;

  constructor(notifications: NotificationStore = getProcessStore()) {
    this.notifications = notifications;
  }

  listByRecipient(
    recipientAccountId: string,
  ): Promise<readonly NotificationInboxItem[]> {
    return Promise.resolve(
      [...this.notifications.values()].filter(
        (notification) =>
          notification.recipientAccountId === recipientAccountId,
      ),
    );
  }

  findForRecipient(
    recipientAccountId: string,
    notificationId: string,
  ): Promise<NotificationInboxItem | null> {
    const notification = this.notifications.get(notificationId);
    return Promise.resolve(
      notification?.recipientAccountId === recipientAccountId
        ? notification
        : null,
    );
  }

  replace(notification: NotificationInboxItem): Promise<void> {
    this.notifications.set(notification.notificationId, notification);
    return Promise.resolve();
  }
}
