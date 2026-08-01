import type { PostgresMigration } from "@support/database/postgres";
import { describe, expect, it } from "vitest";

import { postgresAccountEmailMigrations } from "./src/modules/identity/account-emails/adapters/outbound/persistence/postgres-account-email.migrations";
import { postgresAccountMigrations } from "./src/modules/identity/accounts/adapters/outbound/persistence/postgres-account.migrations";
import { postgresAuthenticationMigrations } from "./src/modules/identity/authentication/adapters/outbound/persistence/postgres-authentication.migrations";
import { postgresSupabaseAuthMigrations } from "./src/modules/identity/authentication/adapters/outbound/persistence/postgres-supabase-auth.migrations";
import { postgresEnterpriseTeamMigrations } from "./src/modules/enterprises/enterprise-teams/adapters/outbound/persistence/postgres-enterprise-team.migrations";
import { postgresEnterpriseMigrations } from "./src/modules/enterprises/enterprises/adapters/outbound/persistence/postgres-enterprise.migrations";
import { postgresCustomPropertyMigrations } from "./src/modules/organizations/custom-properties/adapters/outbound/persistence/postgres-custom-property.migrations";
import { postgresOrganizationMembershipMigrations } from "./src/modules/organizations/organization-memberships/adapters/outbound/persistence/postgres-organization-membership.migrations";
import { postgresOrganizationPolicyMigrations } from "./src/modules/organizations/organization-policies/adapters/outbound/persistence/postgres-organization-policy.migrations";
import { postgresOrganizationRoleAssignmentMigrations } from "./src/modules/organizations/organization-roles/adapters/outbound/persistence/postgres-organization-role-assignment.migrations";
import { postgresOrganizationTeamMigrations } from "./src/modules/organizations/organization-teams/adapters/outbound/persistence/postgres-organization-team.migrations";
import { postgresOrganizationMigrations } from "./src/modules/organizations/organizations/adapters/outbound/persistence/postgres-organization.migrations";
import { postgresAuditStorageMigrations } from "./src/modules/platform/audit-storage/adapters/outbound/persistence/postgres-audit-storage.migrations";
import { postgresEventPublicationMigrations } from "./src/modules/platform/event-publication/adapters/outbound/persistence/postgres-event-publication.migrations";
import { postgresChannelDeliveryMigrations } from "./src/modules/platform/notification-channels/adapters/outbound/persistence/postgres-channel-delivery.migrations";
import { postgresScheduledCommandMigrations } from "./src/modules/platform/scheduled-commands/adapters/outbound/persistence/postgres-scheduled-command.migrations";
import { postgresRepositoryMigrations } from "./src/modules/repositories/repositories/adapters/outbound/persistence/postgres-repository.migrations";
import { postgresRepositoryGrantMigrations } from "./src/modules/repositories/repository-access/adapters/outbound/persistence/postgres-repository-grant.migrations";

const migrationGroups: Readonly<
  Record<string, readonly PostgresMigration[]>
> = {
  accounts: postgresAccountMigrations,
  "account-emails": postgresAccountEmailMigrations,
  authentication: postgresAuthenticationMigrations,
  "supabase-authentication": postgresSupabaseAuthMigrations,
  enterprises: postgresEnterpriseMigrations,
  "enterprise-teams": postgresEnterpriseTeamMigrations,
  organizations: postgresOrganizationMigrations,
  "organization-memberships": postgresOrganizationMembershipMigrations,
  "organization-teams": postgresOrganizationTeamMigrations,
  "organization-roles": postgresOrganizationRoleAssignmentMigrations,
  "organization-policies": postgresOrganizationPolicyMigrations,
  repositories: postgresRepositoryMigrations,
  "repository-access": postgresRepositoryGrantMigrations,
  "custom-properties": postgresCustomPropertyMigrations,
  "audit-storage": postgresAuditStorageMigrations,
  "event-publication": postgresEventPublicationMigrations,
  "notification-channels": postgresChannelDeliveryMigrations,
  "scheduled-commands": postgresScheduledCommandMigrations,
};

function matchingTables(sql: string, expression: RegExp): Set<string> {
  return new Set(
    [...sql.matchAll(expression)].flatMap((match) =>
      match[1] === undefined ? [] : [match[1]],
    ),
  );
}

describe("PostgreSQL RLS migrations", () => {
  it.each(Object.entries(migrationGroups))(
    "enables RLS for every public support table in %s",
    (_name, migrations) => {
      const sql = migrations.map((migration) => migration.sql).join("\n");
      const created = matchingTables(
        sql,
        /create table if not exists\s+(support_[a-z0-9_]+)/gi,
      );
      const hardened = matchingTables(
        sql,
        /alter table\s+(support_[a-z0-9_]+)\s+enable row level security/gi,
      );

      expect(created.size).toBeGreaterThan(0);
      expect([...created].sort()).toEqual([...hardened].sort());
      expect(sql).not.toMatch(
        /create\s+policy|to\s+(?:anon|authenticated)\b/i,
      );
    },
  );
});

describe("Supabase Auth provisioning migrations", () => {
  it("keeps OAuth users pending until a valid username is supplied", () => {
    const migration = postgresSupabaseAuthMigrations.find(
      ({ id }) => id === "identity-authentication-supabase-0002",
    );

    expect(migration).toBeDefined();
    expect(migration?.sql).toMatch(
      /if support_username !~ [\s\S]* then\s+return new;/i,
    );
    expect(migration?.sql).toMatch(
      /if exists \([\s\S]*support_auth_identities[\s\S]*subject = new\.id::text[\s\S]*\) then\s+return new;/i,
    );
    expect(migration?.sql).toMatch(
      /after update of raw_user_meta_data on auth\.users/i,
    );
    expect(migration?.sql).toMatch(
      /execute function support_private\.provision_supabase_user\(\)/i,
    );
  });

  it("keeps provisioning functions private after replacement", () => {
    const migration = postgresSupabaseAuthMigrations.at(-1);

    expect(migration?.sql).toMatch(
      /security definer\s+set search_path = ''/i,
    );
    for (const role of ["public", "anon", "authenticated"]) {
      expect(migration?.sql).toMatch(
        new RegExp(
          String.raw`revoke all on function\s+support_private\.provision_supabase_user\(\)\s+from ${role}`,
          "is",
        ),
      );
      expect(migration?.sql).toMatch(
        new RegExp(
          String.raw`revoke all on function\s+support_private\.sync_supabase_user_email\(\)\s+from ${role}`,
          "is",
        ),
      );
    }
  });
});
