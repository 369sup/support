import { getProductionDatabase } from "../../../../../production-runtime";
import { PostgresNotificationAdapter } from "../adapters/outbound/persistence/postgres-notification.adapter";
import { MarkNotificationReadHandler } from "../application/commands/mark-notification-read.handler";
import type { ListNotificationsUseCase } from "../application/ports/inbound/list-notifications.use-case";
import type { MarkNotificationReadUseCase } from "../application/ports/inbound/mark-notification-read.use-case";
import { ListNotificationsHandler } from "../application/queries/list-notifications.handler";

const notifications = new PostgresNotificationAdapter(
  getProductionDatabase(),
);
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
