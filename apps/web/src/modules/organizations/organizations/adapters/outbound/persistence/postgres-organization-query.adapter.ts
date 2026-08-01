import "server-only";
import { randomUUID } from "node:crypto";
import type {
  SqlRow,
  TransactionalSqlExecutor,
} from "@support/database/postgres";
import type {
  OrganizationQueryRepositoryPort,
  OrganizationQuerySnapshot,
} from "../../../application/ports/outbound/organization-query.repository.port";

type OrganizationRow = SqlRow & {
  organization_id: string;
  login: string;
  display_name: string;
  lifecycle_state: OrganizationQuerySnapshot["lifecycleState"];
};

function mapRow(row: OrganizationRow): OrganizationQuerySnapshot {
  return {
    organizationId: row.organization_id,
    login: row.login,
    displayName: row.display_name,
    lifecycleState: row.lifecycle_state,
  };
}

export class PostgresOrganizationQueryAdapter
  implements OrganizationQueryRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async findById(organizationId: string) {
    const result = await this.database.query<OrganizationRow>(
      `select organization_id, login, display_name, lifecycle_state
         from support_organizations_organizations.support_organizations where organization_id = $1`,
      [organizationId],
    );
    return result.rows[0] === undefined ? null : mapRow(result.rows[0]);
  }

  async findByLogin(login: string) {
    const result = await this.database.query<OrganizationRow>(
      `select organization_id, login, display_name, lifecycle_state
         from support_organizations_organizations.support_organizations where normalized_login = lower($1)`,
      [login],
    );
    return result.rows[0] === undefined ? null : mapRow(result.rows[0]);
  }

  async createWithOwner(
    organization: OrganizationQuerySnapshot,
    ownerAccountId: string,
  ): Promise<"created" | "conflict"> {
    return this.database.transaction(async (connection) => {
      const inserted = await connection.query(
        `insert into support_organizations_organizations.support_organizations (
           organization_id, login, normalized_login, display_name, lifecycle_state
         ) values ($1, $2, lower($2), $3, $4)
         on conflict (normalized_login) do nothing`,
        [
          organization.organizationId,
          organization.login,
          organization.displayName,
          organization.lifecycleState,
        ],
      );
      if (inserted.rowCount === 0) {
        return "conflict";
      }
      await connection.query(
        `insert into support_organizations_organization_memberships.support_organization_memberships (
           membership_id, organization_id, account_id, role, state, source
         ) values ($1, $2, $3, 'owner', 'active', 'direct')`,
        [randomUUID(), organization.organizationId, ownerAccountId],
      );
      return "created";
    });
  }
}
