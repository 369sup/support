import type { PostgresMigration } from "@support/database/postgres";

export const postgresOrganizationMigrations: readonly PostgresMigration[] = [
  {
    id: "zz010_organizations_organizations",
    sql: `
      create table if not exists support_organizations (
        organization_id text primary key,
        login text not null,
        normalized_login text not null unique,
        display_name text not null,
        lifecycle_state text not null check (lifecycle_state in ('active', 'suspended', 'deleted')),
        created_at timestamptz not null default now()
      );

      alter table support_organizations enable row level security;
    `,
  },
];
