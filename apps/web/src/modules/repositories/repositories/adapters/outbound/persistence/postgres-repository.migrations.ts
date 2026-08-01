import type { PostgresMigration } from "@support/database/postgres";

export const postgresRepositoryMigrations: readonly PostgresMigration[] = [
  {
    id: "zz050_repositories_repositories",
    sql: `
      create table if not exists support_repositories (
        repository_id text primary key,
        owner_kind text not null check (owner_kind in ('personal', 'organization')),
        owner_id text not null,
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
    `,
  },
];
