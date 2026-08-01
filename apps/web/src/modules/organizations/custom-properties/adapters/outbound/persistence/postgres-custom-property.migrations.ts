import type { PostgresMigration } from "@support/database/postgres";

export const postgresCustomPropertyMigrations: readonly PostgresMigration[] = [
  {
    id: "zz070_organizations_custom_properties",
    sql: `
      create table if not exists support_organization_repository_properties (
        property_id text primary key,
        organization_id text not null references support_organizations(organization_id),
        name text not null,
        normalized_name text not null,
        description text not null default '',
        value_type text not null check (value_type in ('text', 'single-select', 'multi-select', 'true-false')),
        allowed_values jsonb not null default '[]'::jsonb,
        default_value jsonb,
        required boolean not null default false,
        require_explicit_value boolean not null default false,
        repository_actors_can_set boolean not null default false,
        unique (organization_id, normalized_name),
        check (jsonb_typeof(allowed_values) = 'array')
      );

      create table if not exists support_repository_property_values (
        repository_id text not null references support_repositories(repository_id),
        property_id text not null references support_organization_repository_properties(property_id),
        value jsonb,
        source text not null check (source in ('explicit', 'default')),
        updated_by_account_id text not null references support_accounts(account_id),
        updated_at timestamptz not null default now(),
        primary key (repository_id, property_id)
      );

      create index if not exists support_repository_property_values_search_idx
        on support_repository_property_values using gin (value);

      alter table support_organization_repository_properties enable row level security;
      alter table support_repository_property_values enable row level security;
    `,
  },
];
