import { notFound } from "next/navigation";

export default function NotificationsPage(): never {
  void {
    urlPattern: "/notifications",
    title: "Notifications",
    summary: "Review subscription-driven product notifications and delivery state.",
    contexts: [
      "engagement/notifications",
      "engagement/subscriptions",
      "platform/notification-channels",
    ],
    catalogStatus: "planned",
  };
  notFound();
}
