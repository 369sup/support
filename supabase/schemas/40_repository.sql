-- Desired database state. Do not edit migration history to change it.

-- Historical origin: zz050_repositories_repositories
create table if not exists support_repositories (
        repository_id uuid primary key,
        owner_kind text not null check (owner_kind in ('personal', 'organization')),
        owner_id uuid not null,
        owner_username text not null,
        normalized_name text not null,
        name text not null,
        description text not null default '',
        homepage text not null default '',
        visibility text not null check (visibility in ('public', 'private', 'internal')),
        lifecycle_state text not null check (lifecycle_state in ('active', 'archived', 'deleted')),
        version integer not null check (version >= 1),
        created_at timestamptz not null,
        updated_at timestamptz not null,
        deleted_at timestamptz,
        restore_until timestamptz,
        unique (owner_id, normalized_name)
      );

      create index if not exists support_repositories_owner_idx
        on support_repositories (owner_id, updated_at desc);

      alter table support_repositories enable row level security;

-- Historical origin: zz060_repositories_repository_access
create table if not exists support_repository_account_grants (
        grant_id uuid primary key,
        repository_id uuid not null references support_repositories(repository_id),
        account_id uuid not null references support_accounts(account_id),
        permission text not null check (permission in ('read', 'triage', 'write', 'maintain', 'admin')),
        state text not null check (state in ('active', 'revoked')),
        unique (repository_id, account_id)
      );

      create table if not exists support_repository_team_grants (
        grant_id uuid primary key,
        repository_id uuid not null references support_repositories(repository_id),
        organization_id uuid not null references support_organizations(organization_id),
        team_id uuid not null references support_organization_teams(team_id),
        permission text not null check (permission in ('read', 'triage', 'write', 'maintain', 'admin')),
        state text not null check (state in ('active', 'revoked')),
        unique (repository_id, team_id)
      );

      create index if not exists support_repository_account_grants_account_fk_idx
        on support_repository_account_grants (account_id);
      create index if not exists support_repository_team_grants_team_fk_idx
        on support_repository_team_grants (team_id);
      create index if not exists support_repository_team_grants_organization_fk_idx
        on support_repository_team_grants (organization_id);

      alter table support_repository_account_grants enable row level security;
      alter table support_repository_team_grants enable row level security;
