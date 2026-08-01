import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { NotificationRepositoryPort } from "../../../application/ports/outbound/notification.repository.port";
import type { NotificationInboxItem } from "../../../contracts/notification-inbox-item";

type NotificationRow = SqlRow & {
  notification_id: string;
  reason: NotificationInboxItem["reason"];
  recipient_account_id: string;
  repository_id: string;
  repository_label: string;
  state: NotificationInboxItem["state"];
  subject_href: string;
  subject_label: string;
  updated_at: Date | string;
};

const notificationColumns = `
  notification_id,
  recipient_account_id,
  repository_id,
  repository_label,
  subject_label,
  subject_href,
  reason,
  state,
  updated_at
`;

function mapNotification(row: NotificationRow): NotificationInboxItem {
  return {
    notificationId: row.notification_id,
    recipientAccountId: row.recipient_account_id,
    repositoryId: row.repository_id,
    repositoryLabel: row.repository_label,
    subjectLabel: row.subject_label,
    subjectHref: row.subject_href,
    reason: row.reason,
    state: row.state,
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : new Date(row.updated_at).toISOString(),
  };
}

export class PostgresNotificationAdapter
  implements NotificationRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async listByRecipient(
    recipientAccountId: string,
  ): Promise<readonly NotificationInboxItem[]> {
    const result = await this.database.query<NotificationRow>(
      `
        select ${notificationColumns}
        from support_engagement_notifications.support_notifications
        where recipient_account_id = $1
        order by updated_at desc, notification_id
      `,
      [recipientAccountId],
    );
    return result.rows.map(mapNotification);
  }

  async findForRecipient(
    recipientAccountId: string,
    notificationId: string,
  ): Promise<NotificationInboxItem | null> {
    const result = await this.database.query<NotificationRow>(
      `
        select ${notificationColumns}
        from support_engagement_notifications.support_notifications
        where recipient_account_id = $1 and notification_id = $2
      `,
      [recipientAccountId, notificationId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapNotification(row);
  }

  async replace(notification: NotificationInboxItem): Promise<void> {
    await this.database.query(
      `
        insert into support_engagement_notifications.support_notifications (
          notification_id,
          recipient_account_id,
          repository_id,
          repository_label,
          subject_label,
          subject_href,
          reason,
          state,
          updated_at
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        on conflict (notification_id) do update
        set recipient_account_id = excluded.recipient_account_id,
            repository_id = excluded.repository_id,
            repository_label = excluded.repository_label,
            subject_label = excluded.subject_label,
            subject_href = excluded.subject_href,
            reason = excluded.reason,
            state = excluded.state,
            updated_at = excluded.updated_at
      `,
      [
        notification.notificationId,
        notification.recipientAccountId,
        notification.repositoryId,
        notification.repositoryLabel,
        notification.subjectLabel,
        notification.subjectHref,
        notification.reason,
        notification.state,
        notification.updatedAt,
      ],
    );
  }
}
