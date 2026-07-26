import { InMemoryNotificationAdapter } from "../adapters/outbound/persistence/in-memory-notification.adapter";
import { MarkNotificationReadHandler } from "../application/commands/mark-notification-read.handler";
import type { ListNotificationsUseCase } from "../application/ports/inbound/list-notifications.use-case";
import type { MarkNotificationReadUseCase } from "../application/ports/inbound/mark-notification-read.use-case";
import { ListNotificationsHandler } from "../application/queries/list-notifications.handler";

const notifications = new InMemoryNotificationAdapter();
const listNotifications = new ListNotificationsHandler(notifications);
const markNotificationRead = new MarkNotificationReadHandler(notifications);

export const notificationsServerFacade: Readonly<{
  listNotifications: ListNotificationsUseCase["listNotifications"];
  markNotificationRead:
    MarkNotificationReadUseCase["markNotificationRead"];
}> = {
  listNotifications:
    listNotifications.listNotifications.bind(listNotifications),
  markNotificationRead:
    markNotificationRead.markNotificationRead.bind(markNotificationRead),
};
