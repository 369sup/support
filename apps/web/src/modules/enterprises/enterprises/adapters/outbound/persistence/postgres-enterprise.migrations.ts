import type { PostgresMigration } from "@support/database/postgres";

export const postgresEnterpriseMigrations: readonly PostgresMigration[] = [
  {
    id: "zz020_enterprises_enterprises",
    sql: `
      create table if not exists support_enterprises (
        enterprise_id text primary key,
        slug text not null,
        normalized_slug text not null unique,
        display_name text not null,
        enterprise_type text not null check (enterprise_type in ('standard', 'managed-users')),
        lifecycle_state text not null check (lifecycle_state in ('active', 'suspended', 'deleted')),
        created_at timestamptz not null default now()
      );

      create table if not exists support_enterprise_organizations (
        enterprise_id text not null references support_enterprises(enterprise_id),
        organization_id text not null references support_organizations(organization_id),
        attached_at timestamptz not null default now(),
        primary key (enterprise_id, organization_id),
        unique (organization_id)
      );

      create table if not exists support_enterprise_memberships (
        membership_id text primary key,
        enterprise_id text not null references support_enterprises(enterprise_id),
        account_id text not null references support_accounts(account_id),
        affiliation text not null check (affiliation in ('direct', 'organization-derived')),
        state text not null check (state in ('active', 'pending', 'suspended', 'removed')),
        unique (enterprise_id, account_id)
      );

      create table if not exists support_enterprise_role_assignments (
        assignment_id text primary key,
        enterprise_id text not null references support_enterprises(enterprise_id),
        account_id text not null references support_accounts(account_id),
        role_name text not null check (role_name in ('enterprise-owner', 'enterprise-admin')),
        permissions text[] not null,
        unique (enterprise_id, account_id, role_name)
      );

      alter table support_enterprises enable row level security;
      alter table support_enterprise_organizations enable row level security;
      alter table support_enterprise_memberships enable row level security;
      alter table support_enterprise_role_assignments enable row level security;
    `,
  },
];
