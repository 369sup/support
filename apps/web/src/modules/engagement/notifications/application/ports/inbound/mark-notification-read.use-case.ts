export type MarkNotificationReadCommand = Readonly<{
  recipientAccountId: string;
  notificationId: string;
}>;

export type MarkNotificationReadResult =
  | Readonly<{ status: "read" }>
  | Readonly<{ status: "notification-not-found" }>;

export interface MarkNotificationReadUseCase {
  markNotificationRead(
    command: MarkNotificationReadCommand,
  ): Promise<MarkNotificationReadResult>;
}
