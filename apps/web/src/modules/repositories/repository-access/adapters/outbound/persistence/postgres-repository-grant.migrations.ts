import type { PostgresMigration } from "@support/database/postgres";

export const postgresRepositoryGrantMigrations: readonly PostgresMigration[] = [
  {
    id: "zz060_repositories_repository_access",
    sql: `
      create table if not exists support_repository_account_grants (
        grant_id text primary key,
        repository_id text not null references support_repositories(repository_id),
        account_id text not null references support_accounts(account_id),
        permission text not null check (permission in ('read', 'triage', 'write', 'maintain', 'admin')),
        state text not null check (state in ('active', 'revoked')),
        unique (repository_id, account_id)
      );

      create table if not exists support_repository_team_grants (
        grant_id text primary key,
        repository_id text not null references support_repositories(repository_id),
        organization_id text not null,
        team_id text not null references support_organization_teams(team_id),
        permission text not null check (permission in ('read', 'triage', 'write', 'maintain', 'admin')),
        state text not null check (state in ('active', 'revoked')),
        unique (repository_id, team_id)
      );

      alter table support_repository_account_grants enable row level security;
      alter table support_repository_team_grants enable row level security;
    `,
  },
];
