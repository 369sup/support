import { notificationsServerFacade } from "./composition/notifications.composition";

export type {
  NotificationInboxItem,
  NotificationReason,
  NotificationState,
} from "./contracts/notification-inbox-item";
export const listNotifications =
  notificationsServerFacade.listNotifications;
export const markNotificationRead =
  notificationsServerFacade.markNotificationRead;
