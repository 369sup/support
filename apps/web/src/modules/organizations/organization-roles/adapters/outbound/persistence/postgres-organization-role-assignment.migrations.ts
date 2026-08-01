import type { PostgresMigration } from "@support/database/postgres";

export const postgresOrganizationRoleAssignmentMigrations: readonly PostgresMigration[] =
  [
    {
      id: "zz046_organizations_organization_roles",
      sql: `
        create table if not exists support_organization_role_assignments (
          assignment_id text primary key,
          organization_id text not null references support_organizations(organization_id),
          role_key text not null check (
            role_key in (
              'moderator',
              'security-manager',
              'ci-cd-admin',
              'app-manager',
              'all-repository-read',
              'all-repository-triage',
              'all-repository-write',
              'all-repository-maintain',
              'all-repository-admin'
            )
          ),
          subject_kind text not null check (subject_kind in ('account', 'team')),
          subject_id text not null,
          state text not null check (state in ('active', 'revoked')),
          unique (organization_id, subject_kind, subject_id, role_key)
        );

        create index if not exists support_org_role_assignments_org_state_idx
          on support_organization_role_assignments (organization_id, state);

        alter table support_organization_role_assignments enable row level security;
      `,
    },
  ];
