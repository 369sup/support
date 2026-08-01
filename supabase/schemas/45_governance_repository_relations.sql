-- Cross-context relation loaded only after organization, repository, and
-- account authorities exist. Ownership remains organizations/custom-properties.
create table if not exists support_repository_property_values (
  repository_id uuid not null references support_repositories(repository_id),
  property_id uuid not null references support_organization_repository_properties(property_id),
  value jsonb,
  source text not null check (source in ('explicit', 'default')),
  updated_by_account_id uuid not null references support_accounts(account_id),
  updated_at timestamptz not null default now(),
  primary key (repository_id, property_id)
);

create index if not exists support_repository_property_values_search_idx
  on support_repository_property_values using gin (value);
create index if not exists support_repository_property_values_actor_fk_idx
  on support_repository_property_values (updated_by_account_id);
create index if not exists support_repository_property_values_property_fk_idx
  on support_repository_property_values (property_id);

alter table support_repository_property_values enable row level security;
