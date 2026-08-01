import type { PostgresMigration } from "@support/database/postgres";

export const postgresEnterpriseTeamMigrations: readonly PostgresMigration[] = [
  {
    id: "zz045_enterprises_enterprise_teams",
    sql: `
      create table if not exists support_enterprise_teams (
        team_id text primary key,
        enterprise_id text not null references support_enterprises(enterprise_id),
        name text not null,
        slug text not null,
        normalized_slug text not null,
        description text not null default '',
        lifecycle_state text not null check (lifecycle_state in ('active', 'deleted')),
        unique (enterprise_id, normalized_slug)
      );

      create table if not exists support_enterprise_team_memberships (
        team_membership_id text primary key,
        team_id text not null references support_enterprise_teams(team_id),
        enterprise_id text not null references support_enterprises(enterprise_id),
        account_id text not null references support_accounts(account_id),
        state text not null check (state in ('active', 'removed')),
        unique (team_id, account_id)
      );

      create table if not exists support_enterprise_team_organization_grants (
        grant_id text primary key,
        team_id text not null references support_enterprise_teams(team_id),
        enterprise_id text not null references support_enterprises(enterprise_id),
        organization_id text not null references support_organizations(organization_id),
        state text not null check (state in ('active', 'revoked')),
        unique (team_id, organization_id)
      );

      create index if not exists support_enterprise_team_memberships_team_state_idx
        on support_enterprise_team_memberships (team_id, state);
      create index if not exists support_enterprise_team_org_grants_team_state_idx
        on support_enterprise_team_organization_grants (team_id, state);

      alter table support_enterprise_teams enable row level security;
      alter table support_enterprise_team_memberships enable row level security;
      alter table support_enterprise_team_organization_grants enable row level security;
    `,
  },
];
