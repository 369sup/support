import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { DashboardContextSnapshot } from "../../../application/dashboard-snapshot";
import type { DashboardSelectionRepositoryPort } from "../../../application/ports/outbound/dashboard-selection.repository.port";

type SelectionRow = SqlRow & {
  account_id: string | null;
  context_kind: DashboardContextSnapshot["kind"];
  display_name: string;
  login: string;
  organization_id: string | null;
  relationship: "member" | "owner" | null;
};

function mapSelection(row: SelectionRow): DashboardContextSnapshot {
  if (row.context_kind === "personal" && row.account_id !== null) {
    return {
      kind: "personal",
      accountId: row.account_id,
      login: row.login,
      displayName: row.display_name,
    };
  }
  if (
    row.context_kind === "organization" &&
    row.organization_id !== null &&
    row.relationship !== null
  ) {
    return {
      kind: "organization",
      organizationId: row.organization_id,
      login: row.login,
      displayName: row.display_name,
      relationship: row.relationship,
    };
  }
  throw new Error("The stored dashboard selection is invalid.");
}

export class PostgresDashboardSelectionAdapter
  implements DashboardSelectionRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async findBySessionId(
    sessionId: string,
  ): Promise<DashboardContextSnapshot | null> {
    const result = await this.database.query<SelectionRow>(
      `
        select
          context_kind,
          account_id,
          organization_id,
          login,
          display_name,
          relationship
        from support_projections_dashboard.support_dashboard_selections
        where session_id = $1
      `,
      [sessionId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapSelection(row);
  }

  async save(
    sessionId: string,
    context: DashboardContextSnapshot,
  ): Promise<void> {
    await this.database.query(
      `
        insert into support_projections_dashboard.support_dashboard_selections (
          session_id,
          context_kind,
          account_id,
          organization_id,
          login,
          display_name,
          relationship
        ) values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (session_id) do update
        set context_kind = excluded.context_kind,
            account_id = excluded.account_id,
            organization_id = excluded.organization_id,
            login = excluded.login,
            display_name = excluded.display_name,
            relationship = excluded.relationship,
            updated_at = now()
      `,
      [
        sessionId,
        context.kind,
        context.kind === "personal" ? context.accountId : null,
        context.kind === "organization" ? context.organizationId : null,
        context.login,
        context.displayName,
        context.kind === "organization" ? context.relationship : null,
      ],
    );
  }
}
