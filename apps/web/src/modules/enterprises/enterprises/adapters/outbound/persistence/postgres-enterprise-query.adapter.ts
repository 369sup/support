import "server-only";
import { randomUUID } from "node:crypto";
import type {
  SqlRow,
  TransactionalSqlExecutor,
} from "@support/database/postgres";
import type {
  EnterpriseQueryRepositoryPort,
  EnterpriseQuerySnapshot,
} from "../../../application/ports/outbound/enterprise-query.repository.port";

type EnterpriseRow = SqlRow & {
  enterprise_id: string;
  slug: string;
  display_name: string;
  enterprise_type: EnterpriseQuerySnapshot["enterpriseType"];
  lifecycle_state: EnterpriseQuerySnapshot["lifecycleState"];
};

function mapRow(row: EnterpriseRow): EnterpriseQuerySnapshot {
  return {
    enterpriseId: row.enterprise_id,
    slug: row.slug,
    displayName: row.display_name,
    enterpriseType: row.enterprise_type,
    lifecycleState: row.lifecycle_state,
  };
}

export class PostgresEnterpriseQueryAdapter
  implements EnterpriseQueryRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;
  private readonly isSchemaReady: Promise<void>;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
    this.isSchemaReady = this.assertSchema();
  }

  private async assertSchema(): Promise<void> {
    const result = await this.database.query<{ isReady: boolean }>(
      `select exists (
         select 1 from support_schema_migrations
         where migration_id = 'zz020_enterprises_enterprises'
       ) as "isReady"`,
    );
    if (result.rows[0]?.isReady !== true) {
      throw new Error("Enterprise schema is unavailable.");
    }
  }

  async findBySlug(slug: string) {
    await this.isSchemaReady;
    const result = await this.database.query<EnterpriseRow>(
      `select enterprise_id, slug, display_name, enterprise_type, lifecycle_state
         from support_enterprises where normalized_slug = lower($1)`,
      [slug],
    );
    return result.rows[0] === undefined ? null : mapRow(result.rows[0]);
  }

  async findOrganizationIds(enterpriseId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<{ organization_id: string }>(
      `select organization_id from support_enterprise_organizations
        where enterprise_id = $1 order by organization_id`,
      [enterpriseId],
    );
    return result.rows.map((row) => row.organization_id);
  }

  async createWithOwner(
    enterprise: EnterpriseQuerySnapshot,
    ownerAccountId: string,
  ): Promise<"created" | "conflict"> {
    await this.isSchemaReady;
    return this.database.transaction(async (connection) => {
      const inserted = await connection.query(
        `insert into support_enterprises (
           enterprise_id, slug, normalized_slug, display_name,
           enterprise_type, lifecycle_state
         ) values ($1, $2, lower($2), $3, $4, $5)
         on conflict (normalized_slug) do nothing`,
        [
          enterprise.enterpriseId,
          enterprise.slug,
          enterprise.displayName,
          enterprise.enterpriseType,
          enterprise.lifecycleState,
        ],
      );
      if (inserted.rowCount === 0) {
        return "conflict";
      }
      await connection.query(
        `insert into support_enterprise_memberships (
           membership_id, enterprise_id, account_id, affiliation, state
         ) values ($1, $2, $3, 'direct', 'active')`,
        [randomUUID(), enterprise.enterpriseId, ownerAccountId],
      );
      await connection.query(
        `insert into support_enterprise_role_assignments (
           assignment_id, enterprise_id, account_id, role_name, permissions
         ) values (
           $1, $2, $3, 'enterprise-owner',
           array['view-enterprise', 'manage-enterprise']::text[]
         )`,
        [randomUUID(), enterprise.enterpriseId, ownerAccountId],
      );
      return "created";
    });
  }

  async attachOrganization(
    enterpriseId: string,
    organizationId: string,
  ): Promise<"attached" | "organization-already-attached"> {
    await this.isSchemaReady;
    const result = await this.database.query(
      `insert into support_enterprise_organizations (
         enterprise_id, organization_id
       ) values ($1, $2)
       on conflict (organization_id) do nothing`,
      [enterpriseId, organizationId],
    );
    return result.rowCount === 1
      ? "attached"
      : "organization-already-attached";
  }
}
