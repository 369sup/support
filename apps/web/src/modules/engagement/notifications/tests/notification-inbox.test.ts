import { expect, it } from "vitest";

import { InMemoryNotificationAdapter } from "../adapters/outbound/persistence/in-memory-notification.adapter";
import { MarkNotificationReadHandler } from "../application/commands/mark-notification-read.handler";

it("does not let another recipient mark a notification read", async () => {
  const handler = new MarkNotificationReadHandler(
    new InMemoryNotificationAdapter(),
  );
  await expect(
    handler.markNotificationRead({
      recipientAccountId: "account_other",
      notificationId: "notification_issue_comment",
    }),
  ).resolves.toEqual({ status: "notification-not-found" });
});
