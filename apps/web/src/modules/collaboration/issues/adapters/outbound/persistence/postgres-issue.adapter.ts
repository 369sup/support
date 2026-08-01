import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { IssueRepositoryPort } from "../../../application/ports/outbound/issue.repository.port";
import type { RepositoryIssue } from "../../../contracts/repository-issue";

type IssueRow = SqlRow & {
  author_account_id: string;
  author_username: string;
  body: string;
  created_at: Date | string;
  issue_id: string;
  number: number;
  repository_id: string;
  state: RepositoryIssue["state"];
  title: string;
  updated_at: Date | string;
};

type NumberRow = SqlRow & { number: number };

const issueColumns = `
  issue_id,
  repository_id,
  number,
  title,
  body,
  state,
  author_account_id,
  author_username,
  created_at,
  updated_at
`;

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapIssue(row: IssueRow): RepositoryIssue {
  return {
    issueId: row.issue_id,
    repositoryId: row.repository_id,
    number: row.number,
    title: row.title,
    body: row.body,
    state: row.state,
    authorAccountId: row.author_account_id,
    authorUsername: row.author_username,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export class PostgresIssueAdapter implements IssueRepositoryPort {
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async listByRepository(
    repositoryId: string,
  ): Promise<readonly RepositoryIssue[]> {
    const result = await this.database.query<IssueRow>(
      `
        select ${issueColumns}
        from support_collaboration_issues.support_repository_issues
        where repository_id = $1
        order by number desc
      `,
      [repositoryId],
    );
    return result.rows.map(mapIssue);
  }

  async findByRepositoryAndNumber(
    repositoryId: string,
    number: number,
  ): Promise<RepositoryIssue | null> {
    const result = await this.database.query<IssueRow>(
      `
        select ${issueColumns}
        from support_collaboration_issues.support_repository_issues
        where repository_id = $1 and number = $2
      `,
      [repositoryId, number],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapIssue(row);
  }

  async nextNumber(repositoryId: string): Promise<number> {
    const result = await this.database.query<NumberRow>(
      `
        insert into support_collaboration_issues.support_repository_issue_counters (
          repository_id,
          next_number
        ) values ($1, 2)
        on conflict (repository_id) do update
        set next_number =
          support_collaboration_issues.support_repository_issue_counters.next_number + 1
        returning next_number - 1 as number
      `,
      [repositoryId],
    );
    const row = result.rows[0];
    if (row === undefined) {
      throw new Error("Unable to reserve a repository issue number.");
    }
    return row.number;
  }

  async insert(issue: RepositoryIssue): Promise<void> {
    await this.database.query(
      `
        insert into support_collaboration_issues.support_repository_issues (
          issue_id,
          repository_id,
          number,
          title,
          body,
          state,
          author_account_id,
          author_username,
          created_at,
          updated_at
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        issue.issueId,
        issue.repositoryId,
        issue.number,
        issue.title,
        issue.body,
        issue.state,
        issue.authorAccountId,
        issue.authorUsername,
        issue.createdAt,
        issue.updatedAt,
      ],
    );
  }
}
