import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { ActivityFeedRepositoryPort } from "../../../application/ports/outbound/activity-feed.repository.port";
import type { ActivityItem } from "../../../contracts/activity-item";

type ActivityRow = SqlRow & {
  activity_id: string;
  actor_username: string;
  href: string;
  kind: ActivityItem["kind"];
  occurred_at: Date | string;
  repository_id: string;
  summary: string;
};

export class PostgresActivityFeedAdapter
  implements ActivityFeedRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async listByRepository(
    repositoryId: string,
  ): Promise<readonly ActivityItem[]> {
    const result = await this.database.query<ActivityRow>(
      `
        select
          activity_id,
          repository_id,
          actor_username,
          kind,
          summary,
          href,
          occurred_at
        from support_projections_activity_feed.support_repository_activity_feed
        where repository_id = $1
        order by occurred_at desc, activity_id
        limit 100
      `,
      [repositoryId],
    );
    return result.rows.map((row) => ({
      activityId: row.activity_id,
      repositoryId: row.repository_id,
      actorUsername: row.actor_username,
      kind: row.kind,
      summary: row.summary,
      href: row.href,
      occurredAt:
        row.occurred_at instanceof Date
          ? row.occurred_at.toISOString()
          : new Date(row.occurred_at).toISOString(),
    }));
  }
}
