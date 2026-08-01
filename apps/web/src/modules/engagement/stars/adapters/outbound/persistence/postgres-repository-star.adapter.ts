import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { RepositoryStarRepositoryPort } from "../../../application/ports/outbound/repository-star.repository.port";
import type { RepositoryStargazer } from "../../../contracts/repository-star";

type StarRow = SqlRow & {
  account_id: string;
  starred_at: Date | string;
  username: string;
};

function mapStargazer(row: StarRow): RepositoryStargazer {
  return {
    accountId: row.account_id,
    username: row.username,
    starredAt:
      row.starred_at instanceof Date
        ? row.starred_at.toISOString()
        : new Date(row.starred_at).toISOString(),
  };
}

export class PostgresRepositoryStarAdapter
  implements RepositoryStarRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async find(
    repositoryId: string,
    accountId: string,
  ): Promise<RepositoryStargazer | null> {
    const result = await this.database.query<StarRow>(
      `
        select account_id, username, starred_at
        from support_engagement_stars.support_repository_stars
        where repository_id = $1 and account_id = $2
      `,
      [repositoryId, accountId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapStargazer(row);
  }

  async list(repositoryId: string): Promise<readonly RepositoryStargazer[]> {
    const result = await this.database.query<StarRow>(
      `
        select account_id, username, starred_at
        from support_engagement_stars.support_repository_stars
        where repository_id = $1
        order by starred_at desc, account_id
      `,
      [repositoryId],
    );
    return result.rows.map(mapStargazer);
  }

  async insert(
    repositoryId: string,
    stargazer: RepositoryStargazer,
  ): Promise<void> {
    await this.database.query(
      `
        insert into support_engagement_stars.support_repository_stars (
          repository_id,
          account_id,
          username,
          starred_at
        ) values ($1, $2, $3, $4)
        on conflict (repository_id, account_id) do nothing
      `,
      [
        repositoryId,
        stargazer.accountId,
        stargazer.username,
        stargazer.starredAt,
      ],
    );
  }

  async remove(repositoryId: string, accountId: string): Promise<void> {
    await this.database.query(
      `
        delete from support_engagement_stars.support_repository_stars
        where repository_id = $1 and account_id = $2
      `,
      [repositoryId, accountId],
    );
  }
}
