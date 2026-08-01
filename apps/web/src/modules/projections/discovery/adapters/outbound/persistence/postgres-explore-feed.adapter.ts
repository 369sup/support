import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { ExploreFeedRepositoryPort } from "../../../application/ports/outbound/explore-feed.repository.port";
import type { ExploreFeed } from "../../../contracts/explore-feed";

type RepositoryRow = SqlRow & {
  description: string;
  name: string;
  owner_username: string;
};

export class PostgresExploreFeedAdapter
  implements ExploreFeedRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async get(): Promise<ExploreFeed> {
    const result = await this.database.query<RepositoryRow>(
      `
        select owner_username, name, description
        from support_projections_discovery.support_public_repository_discovery
        order by updated_at desc, owner_username, name
        limit 50
      `,
    );
    return {
      collections: [],
      repositories: result.rows.map((repository) => ({
        description: repository.description,
        href: `/${repository.owner_username}/${repository.name}`,
        label: `${repository.owner_username}/${repository.name}`,
        topics: [],
      })),
      topics: [],
    };
  }
}
