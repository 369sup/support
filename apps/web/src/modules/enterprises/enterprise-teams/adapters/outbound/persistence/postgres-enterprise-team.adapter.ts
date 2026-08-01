import type { SqlExecutor, SqlRow } from "@support/database/postgres";

import type { EnterpriseTeamRepositoryPort } from "../../../application/ports/outbound/enterprise-team.repository.port";
import type {
  EnterpriseTeamMembershipReference,
  EnterpriseTeamOrganizationGrantReference,
  EnterpriseTeamReference,
} from "../../../contracts/enterprise-team-reference";

type TeamRow = SqlRow & {
  team_id: string;
  enterprise_id: string;
  name: string;
  slug: string;
  description: string;
  lifecycle_state: "active" | "deleted";
};

type MembershipRow = SqlRow & {
  team_membership_id: string;
  team_id: string;
  enterprise_id: string;
  account_id: string;
  state: "active" | "removed";
};

type OrganizationGrantRow = SqlRow & {
  grant_id: string;
  team_id: string;
  enterprise_id: string;
  organization_id: string;
  state: "active" | "revoked";
};

const teamColumns =
  "team_id, enterprise_id, name, slug, description, lifecycle_state";
const membershipColumns =
  "team_membership_id, team_id, enterprise_id, account_id, state";
const organizationGrantColumns =
  "grant_id, team_id, enterprise_id, organization_id, state";

function mapTeam(row: TeamRow): EnterpriseTeamReference {
  return {
    teamId: row.team_id,
    enterpriseId: row.enterprise_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    lifecycleState: row.lifecycle_state,
  };
}

function mapMembership(
  row: MembershipRow,
): EnterpriseTeamMembershipReference {
  return {
    teamMembershipId: row.team_membership_id,
    teamId: row.team_id,
    enterpriseId: row.enterprise_id,
    accountId: row.account_id,
    state: row.state,
  };
}

function mapOrganizationGrant(
  row: OrganizationGrantRow,
): EnterpriseTeamOrganizationGrantReference {
  return {
    grantId: row.grant_id,
    teamId: row.team_id,
    enterpriseId: row.enterprise_id,
    organizationId: row.organization_id,
    state: row.state,
  };
}

export class PostgresEnterpriseTeamAdapter
  implements EnterpriseTeamRepositoryPort
{
  private readonly database: SqlExecutor;
  private readonly isSchemaReady: Promise<void>;

  constructor(database: SqlExecutor) {
    this.database = database;
    this.isSchemaReady = this.assertSchema();
  }

  private async assertSchema() {
    const result = await this.database.query<{ isReady: boolean }>(
      `select exists (
         select 1 from support_schema_migrations
         where migration_id = 'zz045_enterprises_enterprise_teams'
       ) as "isReady"`,
    );
    if (result.rows[0]?.isReady !== true) {
      throw new Error("Enterprise team schema is unavailable.");
    }
  }

  async countActiveTeamsByEnterprise(enterpriseId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<{ count: string }>(
      `select count(*)::text as count from support_enterprise_teams
        where enterprise_id = $1 and lifecycle_state = 'active'`,
      [enterpriseId],
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  async findTeamById(teamId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<TeamRow>(
      `select ${teamColumns} from support_enterprise_teams where team_id = $1`,
      [teamId],
    );
    return result.rows[0] === undefined ? null : mapTeam(result.rows[0]);
  }

  async findTeamByEnterpriseAndSlug(enterpriseId: string, slug: string) {
    await this.isSchemaReady;
    const result = await this.database.query<TeamRow>(
      `select ${teamColumns} from support_enterprise_teams
        where enterprise_id = $1 and normalized_slug = lower($2)`,
      [enterpriseId, slug],
    );
    return result.rows[0] === undefined ? null : mapTeam(result.rows[0]);
  }

  async listActiveTeamsByEnterprise(enterpriseId: string, limit: number) {
    await this.isSchemaReady;
    const result = await this.database.query<TeamRow>(
      `select ${teamColumns} from support_enterprise_teams
        where enterprise_id = $1 and lifecycle_state = 'active'
        order by name, team_id limit $2`,
      [enterpriseId, limit],
    );
    return result.rows.map(mapTeam);
  }

  async saveTeam(team: EnterpriseTeamReference) {
    await this.isSchemaReady;
    await this.database.query(
      `insert into support_enterprise_teams (
         team_id, enterprise_id, name, slug, normalized_slug, description, lifecycle_state
       ) values ($1, $2, $3, $4, lower($4), $5, $6)
       on conflict (team_id) do update set
         enterprise_id = excluded.enterprise_id,
         name = excluded.name,
         slug = excluded.slug,
         normalized_slug = excluded.normalized_slug,
         description = excluded.description,
         lifecycle_state = excluded.lifecycle_state`,
      [
        team.teamId,
        team.enterpriseId,
        team.name,
        team.slug,
        team.description,
        team.lifecycleState,
      ],
    );
  }

  async countActiveMembershipsByTeam(teamId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<{ count: string }>(
      `select count(*)::text as count from support_enterprise_team_memberships
        where team_id = $1 and state = 'active'`,
      [teamId],
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  async findActiveMembership(teamId: string, accountId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<MembershipRow>(
      `select ${membershipColumns} from support_enterprise_team_memberships
        where team_id = $1 and account_id = $2 and state = 'active'`,
      [teamId, accountId],
    );
    return result.rows[0] === undefined
      ? null
      : mapMembership(result.rows[0]);
  }

  async listActiveMembershipsByTeam(teamId: string, limit: number) {
    await this.isSchemaReady;
    const result = await this.database.query<MembershipRow>(
      `select ${membershipColumns} from support_enterprise_team_memberships
        where team_id = $1 and state = 'active'
        order by account_id limit $2`,
      [teamId, limit],
    );
    return result.rows.map(mapMembership);
  }

  async saveMembership(membership: EnterpriseTeamMembershipReference) {
    await this.isSchemaReady;
    await this.database.query(
      `insert into support_enterprise_team_memberships (
         team_membership_id, team_id, enterprise_id, account_id, state
       ) values ($1, $2, $3, $4, $5)
       on conflict (team_id, account_id) do update set
         team_membership_id = excluded.team_membership_id,
         enterprise_id = excluded.enterprise_id,
         state = excluded.state`,
      [
        membership.teamMembershipId,
        membership.teamId,
        membership.enterpriseId,
        membership.accountId,
        membership.state,
      ],
    );
  }

  async countActiveOrganizationGrantsByTeam(teamId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<{ count: string }>(
      `select count(*)::text as count
         from support_enterprise_team_organization_grants
        where team_id = $1 and state = 'active'`,
      [teamId],
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  async findActiveOrganizationGrant(teamId: string, organizationId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<OrganizationGrantRow>(
      `select ${organizationGrantColumns}
         from support_enterprise_team_organization_grants
        where team_id = $1 and organization_id = $2 and state = 'active'`,
      [teamId, organizationId],
    );
    return result.rows[0] === undefined
      ? null
      : mapOrganizationGrant(result.rows[0]);
  }

  async listActiveOrganizationGrantsByTeam(teamId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<OrganizationGrantRow>(
      `select ${organizationGrantColumns}
         from support_enterprise_team_organization_grants
        where team_id = $1 and state = 'active'
        order by organization_id`,
      [teamId],
    );
    return result.rows.map(mapOrganizationGrant);
  }

  async saveOrganizationGrant(
    grant: EnterpriseTeamOrganizationGrantReference,
  ) {
    await this.isSchemaReady;
    await this.database.query(
      `insert into support_enterprise_team_organization_grants (
         grant_id, team_id, enterprise_id, organization_id, state
       ) values ($1, $2, $3, $4, $5)
       on conflict (team_id, organization_id) do update set
         grant_id = excluded.grant_id,
         enterprise_id = excluded.enterprise_id,
         state = excluded.state`,
      [
        grant.grantId,
        grant.teamId,
        grant.enterpriseId,
        grant.organizationId,
        grant.state,
      ],
    );
  }
}
