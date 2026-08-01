import type {
  ListNotificationsResult,
  ListNotificationsUseCase,
} from "../ports/inbound/list-notifications.use-case";
import type { NotificationRepositoryPort } from "../ports/outbound/notification.repository.port";

export class ListNotificationsHandler implements ListNotificationsUseCase {
  private readonly notifications: NotificationRepositoryPort;

  constructor(notifications: NotificationRepositoryPort) {
    this.notifications = notifications;
  }

  async listNotifications(
    recipientAccountId: string,
  ): Promise<ListNotificationsResult> {
    if (recipientAccountId.trim().length === 0) {
      return { status: "invalid-recipient" };
    }
    return {
      status: "found",
      notifications: (
        await this.notifications.listByRecipient(recipientAccountId)
      ).toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    };
  }
}
