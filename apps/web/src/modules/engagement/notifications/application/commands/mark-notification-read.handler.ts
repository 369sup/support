import type {
  MarkNotificationReadCommand,
  MarkNotificationReadResult,
  MarkNotificationReadUseCase,
} from "../ports/inbound/mark-notification-read.use-case";
import type { NotificationRepositoryPort } from "../ports/outbound/notification.repository.port";

export class MarkNotificationReadHandler
  implements MarkNotificationReadUseCase
{
  private readonly notifications: NotificationRepositoryPort;

  constructor(notifications: NotificationRepositoryPort) {
    this.notifications = notifications;
  }

  async markNotificationRead(
    command: MarkNotificationReadCommand,
  ): Promise<MarkNotificationReadResult> {
    const notification = await this.notifications.findForRecipient(
      command.recipientAccountId,
      command.notificationId,
    );
    if (notification === null) {
      return { status: "notification-not-found" };
    }
    await this.notifications.replace({ ...notification, state: "read" });
    return { status: "read" };
  }
}
