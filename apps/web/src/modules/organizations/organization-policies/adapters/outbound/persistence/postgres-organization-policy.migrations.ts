import type { PostgresMigration } from "@support/database/postgres";

export const postgresOrganizationPolicyMigrations: readonly PostgresMigration[] =
  [
    {
      id: "zz047_organizations_organization_policies",
      sql: `
        create table if not exists support_organization_policies (
          organization_id text primary key references support_organizations(organization_id),
          base_repository_permission text check (
            base_repository_permission in ('read', 'triage', 'write', 'maintain', 'admin')
          ),
          outside_collaborator_oauth_allowed boolean not null default true,
          allowed_oauth_scopes text[] not null default '{}',
          outside_collaborator_github_app_allowed boolean not null default true,
          owner_approval_required_for_additional_permissions boolean not null default false
        );

        alter table support_organization_policies enable row level security;
      `,
    },
  ];
