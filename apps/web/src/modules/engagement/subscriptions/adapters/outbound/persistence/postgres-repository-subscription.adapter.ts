import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { RepositorySubscriptionRepositoryPort } from "../../../application/ports/outbound/repository-subscription.repository.port";
import type { RepositorySubscriber } from "../../../contracts/repository-subscription";

type SubscriptionRow = SqlRow & {
  account_id: string;
  subscribed_at: Date | string;
  username: string;
};

function mapSubscriber(row: SubscriptionRow): RepositorySubscriber {
  return {
    accountId: row.account_id,
    username: row.username,
    subscribedAt:
      row.subscribed_at instanceof Date
        ? row.subscribed_at.toISOString()
        : new Date(row.subscribed_at).toISOString(),
  };
}

export class PostgresRepositorySubscriptionAdapter
  implements RepositorySubscriptionRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async find(
    repositoryId: string,
    accountId: string,
  ): Promise<RepositorySubscriber | null> {
    const result = await this.database.query<SubscriptionRow>(
      `
        select account_id, username, subscribed_at
        from support_engagement_subscriptions.support_repository_subscriptions
        where repository_id = $1 and account_id = $2
      `,
      [repositoryId, accountId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapSubscriber(row);
  }

  async list(repositoryId: string): Promise<readonly RepositorySubscriber[]> {
    const result = await this.database.query<SubscriptionRow>(
      `
        select account_id, username, subscribed_at
        from support_engagement_subscriptions.support_repository_subscriptions
        where repository_id = $1
        order by subscribed_at desc, account_id
      `,
      [repositoryId],
    );
    return result.rows.map(mapSubscriber);
  }

  async insert(
    repositoryId: string,
    subscriber: RepositorySubscriber,
  ): Promise<void> {
    await this.database.query(
      `
        insert into support_engagement_subscriptions.support_repository_subscriptions (
          repository_id,
          account_id,
          username,
          subscribed_at
        ) values ($1, $2, $3, $4)
        on conflict (repository_id, account_id) do nothing
      `,
      [
        repositoryId,
        subscriber.accountId,
        subscriber.username,
        subscriber.subscribedAt,
      ],
    );
  }

  async remove(repositoryId: string, accountId: string): Promise<void> {
    await this.database.query(
      `
        delete from support_engagement_subscriptions.support_repository_subscriptions
        where repository_id = $1 and account_id = $2
      `,
      [repositoryId, accountId],
    );
  }
}
