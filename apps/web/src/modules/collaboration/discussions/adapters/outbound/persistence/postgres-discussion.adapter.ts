import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { DiscussionRepositoryPort } from "../../../application/ports/outbound/discussion.repository.port";
import type { RepositoryDiscussion } from "../../../contracts/repository-discussion";

type DiscussionRow = SqlRow & {
  author_account_id: string;
  author_username: string;
  body: string;
  category: RepositoryDiscussion["category"];
  created_at: Date | string;
  discussion_id: string;
  number: number;
  repository_id: string;
  state: RepositoryDiscussion["state"];
  title: string;
  updated_at: Date | string;
};

type NumberRow = SqlRow & { number: number };

const discussionColumns = `
  discussion_id,
  repository_id,
  number,
  title,
  body,
  category,
  state,
  author_account_id,
  author_username,
  created_at,
  updated_at
`;

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapDiscussion(row: DiscussionRow): RepositoryDiscussion {
  return {
    discussionId: row.discussion_id,
    repositoryId: row.repository_id,
    number: row.number,
    title: row.title,
    body: row.body,
    category: row.category,
    state: row.state,
    authorAccountId: row.author_account_id,
    authorUsername: row.author_username,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export class PostgresDiscussionAdapter implements DiscussionRepositoryPort {
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async findByRepositoryAndNumber(
    repositoryId: string,
    number: number,
  ): Promise<RepositoryDiscussion | null> {
    const result = await this.database.query<DiscussionRow>(
      `
        select ${discussionColumns}
        from support_collaboration_discussions.support_repository_discussions
        where repository_id = $1 and number = $2
      `,
      [repositoryId, number],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapDiscussion(row);
  }

  async insert(discussion: RepositoryDiscussion): Promise<void> {
    await this.database.query(
      `
        insert into support_collaboration_discussions.support_repository_discussions (
          discussion_id,
          repository_id,
          number,
          title,
          body,
          category,
          state,
          author_account_id,
          author_username,
          created_at,
          updated_at
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        discussion.discussionId,
        discussion.repositoryId,
        discussion.number,
        discussion.title,
        discussion.body,
        discussion.category,
        discussion.state,
        discussion.authorAccountId,
        discussion.authorUsername,
        discussion.createdAt,
        discussion.updatedAt,
      ],
    );
  }

  async listByRepository(
    repositoryId: string,
  ): Promise<readonly RepositoryDiscussion[]> {
    const result = await this.database.query<DiscussionRow>(
      `
        select ${discussionColumns}
        from support_collaboration_discussions.support_repository_discussions
        where repository_id = $1
        order by number desc
      `,
      [repositoryId],
    );
    return result.rows.map(mapDiscussion);
  }

  async nextNumber(repositoryId: string): Promise<number> {
    const result = await this.database.query<NumberRow>(
      `
        insert into support_collaboration_discussions.support_repository_discussion_counters (
          repository_id,
          next_number
        ) values ($1, 2)
        on conflict (repository_id) do update
        set next_number =
          support_collaboration_discussions.support_repository_discussion_counters.next_number + 1
        returning next_number - 1 as number
      `,
      [repositoryId],
    );
    const row = result.rows[0];
    if (row === undefined) {
      throw new Error("Unable to reserve a repository discussion number.");
    }
    return row.number;
  }
}
