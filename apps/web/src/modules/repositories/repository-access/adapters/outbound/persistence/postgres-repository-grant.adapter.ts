import type { SqlExecutor, SqlRow } from "@support/database/postgres";
import type {
  RepositoryGrantRepositoryPort,
  RepositoryGrantSnapshot,
} from "../../../application/ports/outbound/repository-grant.repository.port";
import type { TeamRepositoryGrantRepositoryPort } from "../../../application/ports/outbound/team-repository-grant.repository.port";
import type { TeamRepositoryGrantReference } from "../../../contracts/effective-repository-permission-decision";

type DirectGrantRow = SqlRow & {
  grant_id: string;
  repository_id: string;
  account_id: string;
  permission: RepositoryGrantSnapshot["permission"];
  state: RepositoryGrantSnapshot["state"];
};
type TeamGrantRow = SqlRow & {
  grant_id: string;
  repository_id: string;
  organization_id: string;
  team_id: string;
  permission: TeamRepositoryGrantReference["permission"];
  state: TeamRepositoryGrantReference["state"];
};

function mapDirect(row: DirectGrantRow): RepositoryGrantSnapshot {
  return {
    grantId: row.grant_id,
    repositoryId: row.repository_id,
    accountId: row.account_id,
    permission: row.permission,
    state: row.state,
  };
}
function mapTeam(row: TeamGrantRow): TeamRepositoryGrantReference {
  return {
    grantId: row.grant_id,
    repositoryId: row.repository_id,
    organizationId: row.organization_id,
    teamId: row.team_id,
    permission: row.permission,
    state: row.state,
  };
}

export class PostgresRepositoryGrantAdapter
  implements RepositoryGrantRepositoryPort, TeamRepositoryGrantRepositoryPort
{
  private readonly database: SqlExecutor;
  private readonly isSchemaReady: Promise<void>;

  constructor(database: SqlExecutor) {
    this.database = database;
    this.isSchemaReady = this.assertSchema();
  }

  private async assertSchema(): Promise<void> {
    const result = await this.database.query<{ isReady: boolean }>(
      `select exists (
         select 1 from support_schema_migrations
         where migration_id = 'zz060_repositories_repository_access'
       ) as "isReady"`,
    );
    if (result.rows[0]?.isReady !== true) {
      throw new Error("Repository access schema is unavailable.");
    }
  }

  async findActiveByRepositoryAndAccount(
    repositoryId: string,
    accountId: string,
  ) {
    await this.isSchemaReady;
    const result = await this.database.query<DirectGrantRow>(
      `select grant_id, repository_id, account_id, permission, state
         from support_repository_account_grants
        where repository_id = $1 and account_id = $2 and state = 'active'`,
      [repositoryId, accountId],
    );
    return result.rows.map(mapDirect);
  }

  async findActiveByRepository(repositoryId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<TeamGrantRow>(
      `select grant_id, repository_id, organization_id, team_id, permission, state
         from support_repository_team_grants
        where repository_id = $1 and state = 'active'
        order by team_id`,
      [repositoryId],
    );
    return result.rows.map(mapTeam);
  }

  async findActiveByRepositoryAndTeam(repositoryId: string, teamId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<TeamGrantRow>(
      `select grant_id, repository_id, organization_id, team_id, permission, state
         from support_repository_team_grants
        where repository_id = $1 and team_id = $2 and state = 'active'`,
      [repositoryId, teamId],
    );
    return result.rows[0] === undefined ? null : mapTeam(result.rows[0]);
  }

  async saveTeamGrant(grant: TeamRepositoryGrantReference) {
    await this.isSchemaReady;
    await this.database.query(
      `insert into support_repository_team_grants (
         grant_id, repository_id, organization_id, team_id, permission, state
       ) values ($1, $2, $3, $4, $5, $6)
       on conflict (repository_id, team_id) do update set
         grant_id = excluded.grant_id,
         organization_id = excluded.organization_id,
         permission = excluded.permission,
         state = excluded.state`,
      [
        grant.grantId,
        grant.repositoryId,
        grant.organizationId,
        grant.teamId,
        grant.permission,
        grant.state,
      ],
    );
  }
}
