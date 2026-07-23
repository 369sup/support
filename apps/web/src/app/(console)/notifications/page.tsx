import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function NotificationsPage(): never {
  return unavailableRoute({
    urlPattern: "/notifications",
    title: "Notifications",
    summary: "Review subscription-driven product notifications and delivery state.",
    contexts: [
      "engagement/notifications",
      "engagement/subscriptions",
      "platform/notification-channels",
    ],
    catalogStatus: "planned",
  });
}
