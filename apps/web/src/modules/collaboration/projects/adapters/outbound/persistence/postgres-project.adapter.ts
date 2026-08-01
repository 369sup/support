import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { ProjectRepositoryPort } from "../../../application/ports/outbound/project.repository.port";
import type {
  CollaborationProject,
  ProjectItem,
} from "../../../contracts/collaboration-project";

type ProjectRow = SqlRow & {
  description: string;
  items: unknown;
  linked_repository_ids: unknown;
  owner_account_id: string;
  project_id: string;
  state: CollaborationProject["state"];
  title: string;
  updated_at: Date | string;
};

function isProjectItem(value: unknown): value is ProjectItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "itemId" in value &&
    typeof value.itemId === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "status" in value &&
    ["backlog", "in-progress", "done"].includes(String(value.status))
  );
}

function mapProject(row: ProjectRow): CollaborationProject {
  if (
    !Array.isArray(row.items) ||
    !row.items.every(isProjectItem) ||
    !Array.isArray(row.linked_repository_ids) ||
    row.linked_repository_ids.some((id) => typeof id !== "string")
  ) {
    throw new Error("The stored collaboration project is invalid.");
  }
  return {
    projectId: row.project_id,
    ownerAccountId: row.owner_account_id,
    title: row.title,
    description: row.description,
    state: row.state,
    linkedRepositoryIds: row.linked_repository_ids,
    items: row.items,
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : new Date(row.updated_at).toISOString(),
  };
}

const projectColumns = `
  p.project_id,
  p.owner_account_id,
  p.title,
  p.description,
  p.state,
  coalesce(
    (
      select jsonb_agg(link.repository_id order by link.repository_id)
      from support_collaboration_projects.support_project_repositories link
      where link.project_id = p.project_id
    ),
    '[]'::jsonb
  ) as linked_repository_ids,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'itemId', item.item_id,
          'title', item.title,
          'status', item.status
        ) order by item.position
      )
      from support_collaboration_projects.support_project_items item
      where item.project_id = p.project_id
    ),
    '[]'::jsonb
  ) as items,
  p.updated_at
`;

export class PostgresProjectAdapter implements ProjectRepositoryPort {
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async find(projectId: string): Promise<CollaborationProject | null> {
    const result = await this.database.query<ProjectRow>(
      `
        select ${projectColumns}
        from support_collaboration_projects.support_collaboration_projects p
        where p.project_id = $1
      `,
      [projectId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapProject(row);
  }

  async listByAccount(
    accountId: string,
  ): Promise<readonly CollaborationProject[]> {
    const result = await this.database.query<ProjectRow>(
      `
        select ${projectColumns}
        from support_collaboration_projects.support_collaboration_projects p
        where p.owner_account_id = $1
        order by p.updated_at desc, p.project_id
      `,
      [accountId],
    );
    return result.rows.map(mapProject);
  }

  async listByRepository(
    repositoryId: string,
  ): Promise<readonly CollaborationProject[]> {
    const result = await this.database.query<ProjectRow>(
      `
        select ${projectColumns}
        from support_collaboration_projects.support_collaboration_projects p
        where exists (
          select 1
          from support_collaboration_projects.support_project_repositories link
          where link.project_id = p.project_id
            and link.repository_id = $1
        )
        order by p.updated_at desc, p.project_id
      `,
      [repositoryId],
    );
    return result.rows.map(mapProject);
  }

  async replace(project: CollaborationProject): Promise<void> {
    await this.database.transaction(async (connection) => {
      await connection.query(
        `
          insert into support_collaboration_projects.support_collaboration_projects (
            project_id,
            owner_account_id,
            title,
            description,
            state,
            updated_at
          ) values ($1, $2, $3, $4, $5, $6)
          on conflict (project_id) do update
          set owner_account_id = excluded.owner_account_id,
              title = excluded.title,
              description = excluded.description,
              state = excluded.state,
              updated_at = excluded.updated_at
        `,
        [
          project.projectId,
          project.ownerAccountId,
          project.title,
          project.description,
          project.state,
          project.updatedAt,
        ],
      );
      await connection.query(
        "delete from support_collaboration_projects.support_project_repositories where project_id = $1",
        [project.projectId],
      );
      for (const repositoryId of project.linkedRepositoryIds) {
        await connection.query(
          `insert into support_collaboration_projects.support_project_repositories (
             project_id, repository_id
           ) values ($1, $2)`,
          [project.projectId, repositoryId],
        );
      }
      await connection.query(
        "delete from support_collaboration_projects.support_project_items where project_id = $1",
        [project.projectId],
      );
      for (const [position, item] of project.items.entries()) {
        await connection.query(
          `insert into support_collaboration_projects.support_project_items (
             item_id, project_id, position, title, status
           ) values ($1, $2, $3, $4, $5)`,
          [item.itemId, project.projectId, position, item.title, item.status],
        );
      }
    });
  }
}
