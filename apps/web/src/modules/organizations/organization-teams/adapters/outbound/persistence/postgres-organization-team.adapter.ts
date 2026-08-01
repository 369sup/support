import type { SqlExecutor, SqlRow } from "@support/database/postgres";
import type { OrganizationTeamRepositoryPort } from "../../../application/ports/outbound/organization-team.repository.port";
import type {
  OrganizationTeamReference,
  TeamMaintainerReference,
  TeamMembershipReference,
} from "../../../contracts/organization-team-reference";

type TeamRow = SqlRow & {
  team_id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string;
  visibility: "visible" | "secret";
  parent_team_id: string | null;
  lifecycle_state: "active" | "deleted";
};
type MembershipRow = SqlRow & {
  team_membership_id: string;
  team_id: string;
  organization_id: string;
  account_id: string;
  state: "active" | "removed";
};
type MaintainerRow = SqlRow & {
  team_maintainer_id: string;
  team_id: string;
  organization_id: string;
  account_id: string;
  state: "active" | "revoked";
};

const teamColumns =
  "team_id, organization_id, name, slug, description, visibility, parent_team_id, lifecycle_state";
const membershipColumns =
  "team_membership_id, team_id, organization_id, account_id, state";
const maintainerColumns =
  "team_maintainer_id, team_id, organization_id, account_id, state";

function mapTeam(row: TeamRow): OrganizationTeamReference {
  return {
    teamId: row.team_id,
    organizationId: row.organization_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    visibility: row.visibility,
    parentTeamId: row.parent_team_id,
    lifecycleState: row.lifecycle_state,
  };
}
function mapMembership(row: MembershipRow): TeamMembershipReference {
  return {
    teamMembershipId: row.team_membership_id,
    teamId: row.team_id,
    organizationId: row.organization_id,
    accountId: row.account_id,
    state: row.state,
  };
}
function mapMaintainer(row: MaintainerRow): TeamMaintainerReference {
  return {
    teamMaintainerId: row.team_maintainer_id,
    teamId: row.team_id,
    organizationId: row.organization_id,
    accountId: row.account_id,
    state: row.state,
  };
}

export class PostgresOrganizationTeamAdapter
  implements OrganizationTeamRepositoryPort
{
  private readonly database: SqlExecutor;

  constructor(database: SqlExecutor) {
    this.database = database;
  }

  async findTeamById(teamId: string) {
    const result = await this.database.query<TeamRow>(
      `select ${teamColumns} from support_organizations_organization_teams.support_organization_teams where team_id = $1`,
      [teamId],
    );
    return result.rows[0] === undefined ? null : mapTeam(result.rows[0]);
  }

  async findTeamByOrganizationAndSlug(organizationId: string, slug: string) {
    const result = await this.database.query<TeamRow>(
      `select ${teamColumns} from support_organizations_organization_teams.support_organization_teams
        where organization_id = $1 and normalized_slug = lower($2)`,
      [organizationId, slug],
    );
    return result.rows[0] === undefined ? null : mapTeam(result.rows[0]);
  }

  async listTeamsByOrganization(organizationId: string) {
    const result = await this.database.query<TeamRow>(
      `select ${teamColumns} from support_organizations_organization_teams.support_organization_teams
        where organization_id = $1 order by name, team_id`,
      [organizationId],
    );
    return result.rows.map(mapTeam);
  }

  async listActiveChildren(teamId: string) {
    const result = await this.database.query<TeamRow>(
      `select ${teamColumns} from support_organizations_organization_teams.support_organization_teams
        where parent_team_id = $1 and lifecycle_state = 'active'
        order by name, team_id`,
      [teamId],
    );
    return result.rows.map(mapTeam);
  }

  async saveTeam(team: OrganizationTeamReference) {
    await this.database.query(
      `insert into support_organizations_organization_teams.support_organization_teams (
         team_id, organization_id, name, slug, normalized_slug, description,
         visibility, parent_team_id, lifecycle_state
       ) values ($1, $2, $3, $4, lower($4), $5, $6, $7, $8)
       on conflict (team_id) do update set
         organization_id = excluded.organization_id,
         name = excluded.name,
         slug = excluded.slug,
         normalized_slug = excluded.normalized_slug,
         description = excluded.description,
         visibility = excluded.visibility,
         parent_team_id = excluded.parent_team_id,
         lifecycle_state = excluded.lifecycle_state`,
      [
        team.teamId,
        team.organizationId,
        team.name,
        team.slug,
        team.description,
        team.visibility,
        team.parentTeamId,
        team.lifecycleState,
      ],
    );
  }

  async findActiveMembership(teamId: string, accountId: string) {
    const result = await this.database.query<MembershipRow>(
      `select ${membershipColumns}
         from support_organizations_organization_teams.support_organization_team_memberships
        where team_id = $1 and account_id = $2 and state = 'active'`,
      [teamId, accountId],
    );
    return result.rows[0] === undefined ? null : mapMembership(result.rows[0]);
  }

  async listActiveMembershipsByTeam(teamId: string) {
    const result = await this.database.query<MembershipRow>(
      `select ${membershipColumns}
         from support_organizations_organization_teams.support_organization_team_memberships
        where team_id = $1 and state = 'active' order by account_id`,
      [teamId],
    );
    return result.rows.map(mapMembership);
  }

  async listActiveMembershipsByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ) {
    const result = await this.database.query<MembershipRow>(
      `select ${membershipColumns}
         from support_organizations_organization_teams.support_organization_team_memberships
        where account_id = $1 and organization_id = $2 and state = 'active'
        order by team_id`,
      [accountId, organizationId],
    );
    return result.rows.map(mapMembership);
  }

  async saveMembership(membership: TeamMembershipReference) {
    await this.database.query(
      `insert into support_organizations_organization_teams.support_organization_team_memberships (
         team_membership_id, team_id, organization_id, account_id, state
       ) values ($1, $2, $3, $4, $5)
       on conflict (team_id, account_id) do update set
         team_membership_id = excluded.team_membership_id,
         organization_id = excluded.organization_id,
         state = excluded.state`,
      [
        membership.teamMembershipId,
        membership.teamId,
        membership.organizationId,
        membership.accountId,
        membership.state,
      ],
    );
  }

  async findActiveMaintainer(teamId: string, accountId: string) {
    const result = await this.database.query<MaintainerRow>(
      `select ${maintainerColumns}
         from support_organizations_organization_teams.support_organization_team_maintainers
        where team_id = $1 and account_id = $2 and state = 'active'`,
      [teamId, accountId],
    );
    return result.rows[0] === undefined ? null : mapMaintainer(result.rows[0]);
  }

  async saveMaintainer(maintainer: TeamMaintainerReference) {
    await this.database.query(
      `insert into support_organizations_organization_teams.support_organization_team_maintainers (
         team_maintainer_id, team_id, organization_id, account_id, state
       ) values ($1, $2, $3, $4, $5)
       on conflict (team_id, account_id) do update set
         team_maintainer_id = excluded.team_maintainer_id,
         organization_id = excluded.organization_id,
         state = excluded.state`,
      [
        maintainer.teamMaintainerId,
        maintainer.teamId,
        maintainer.organizationId,
        maintainer.accountId,
        maintainer.state,
      ],
    );
  }
}
