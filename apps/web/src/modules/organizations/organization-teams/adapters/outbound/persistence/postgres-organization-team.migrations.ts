import type { PostgresMigration } from "@support/database/postgres";

export const postgresOrganizationTeamMigrations: readonly PostgresMigration[] = [
  {
    id: "zz040_organizations_organization_teams",
    sql: `
      create table if not exists support_organization_teams (
        team_id text primary key,
        organization_id text not null,
        name text not null,
        slug text not null,
        normalized_slug text not null,
        description text not null default '',
        visibility text not null check (visibility in ('visible', 'secret')),
        parent_team_id text references support_organization_teams(team_id),
        lifecycle_state text not null check (lifecycle_state in ('active', 'deleted')),
        unique (organization_id, normalized_slug),
        check (visibility = 'visible' or parent_team_id is null)
      );

      create table if not exists support_organization_team_memberships (
        team_membership_id text primary key,
        team_id text not null references support_organization_teams(team_id),
        organization_id text not null,
        account_id text not null references support_accounts(account_id),
        state text not null check (state in ('active', 'removed')),
        unique (team_id, account_id)
      );

      create table if not exists support_organization_team_maintainers (
        team_maintainer_id text primary key,
        team_id text not null references support_organization_teams(team_id),
        organization_id text not null,
        account_id text not null references support_accounts(account_id),
        state text not null check (state in ('active', 'revoked')),
        unique (team_id, account_id)
      );

      create index if not exists support_team_memberships_account_org_idx
        on support_organization_team_memberships (account_id, organization_id)
        where state = 'active';

      alter table support_organization_teams enable row level security;
      alter table support_organization_team_memberships enable row level security;
      alter table support_organization_team_maintainers enable row level security;
    `,
  },
];
