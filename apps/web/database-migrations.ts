import "server-only";

import type { PostgresMigration } from "@support/database/postgres";

import { postgresAccountEmailMigrations } from "./src/modules/identity/account-emails/adapters/outbound/persistence/postgres-account-email.migrations";
import { postgresAccountMigrations } from "./src/modules/identity/accounts/adapters/outbound/persistence/postgres-account.migrations";
import { postgresSupabaseAuthMigrations } from "./src/modules/identity/authentication/adapters/outbound/persistence/postgres-supabase-auth.migrations";
import { postgresEnterpriseMigrations } from "./src/modules/enterprises/enterprises/adapters/outbound/persistence/postgres-enterprise.migrations";
import { postgresEnterpriseTeamMigrations } from "./src/modules/enterprises/enterprise-teams/adapters/outbound/persistence/postgres-enterprise-team.migrations";
import { postgresOrganizationMigrations } from "./src/modules/organizations/organizations/adapters/outbound/persistence/postgres-organization.migrations";
import { postgresOrganizationTeamMigrations } from "./src/modules/organizations/organization-teams/adapters/outbound/persistence/postgres-organization-team.migrations";
import { postgresOrganizationRoleAssignmentMigrations } from "./src/modules/organizations/organization-roles/adapters/outbound/persistence/postgres-organization-role-assignment.migrations";
import { postgresOrganizationPolicyMigrations } from "./src/modules/organizations/organization-policies/adapters/outbound/persistence/postgres-organization-policy.migrations";
import { postgresOrganizationMembershipMigrations } from "./src/modules/organizations/organization-memberships/adapters/outbound/persistence/postgres-organization-membership.migrations";
import { postgresCustomPropertyMigrations } from "./src/modules/organizations/custom-properties/adapters/outbound/persistence/postgres-custom-property.migrations";
import { postgresRepositoryMigrations } from "./src/modules/repositories/repositories/adapters/outbound/persistence/postgres-repository.migrations";
import { postgresRepositoryGrantMigrations } from "./src/modules/repositories/repository-access/adapters/outbound/persistence/postgres-repository-grant.migrations";
import { postgresAuditStorageMigrations } from "./src/modules/platform/audit-storage/adapters/outbound/persistence/postgres-audit-storage.migrations";
import { postgresEventPublicationMigrations } from "./src/modules/platform/event-publication/adapters/outbound/persistence/postgres-event-publication.migrations";
import { postgresChannelDeliveryMigrations } from "./src/modules/platform/notification-channels/adapters/outbound/persistence/postgres-channel-delivery.migrations";
import { postgresScheduledCommandMigrations } from "./src/modules/platform/scheduled-commands/adapters/outbound/persistence/postgres-scheduled-command.migrations";
import { postgresSecurityHardeningMigrations } from "./postgres-security-hardening.migrations";

export const productionPostgresMigrations: readonly PostgresMigration[] = [
  ...postgresAccountMigrations,
  ...postgresAccountEmailMigrations,
  ...postgresSupabaseAuthMigrations,
  ...postgresOrganizationMigrations,
  ...postgresEnterpriseMigrations,
  ...postgresOrganizationMembershipMigrations,
  ...postgresOrganizationTeamMigrations,
  ...postgresEnterpriseTeamMigrations,
  ...postgresOrganizationRoleAssignmentMigrations,
  ...postgresOrganizationPolicyMigrations,
  ...postgresRepositoryMigrations,
  ...postgresRepositoryGrantMigrations,
  ...postgresCustomPropertyMigrations,
  ...postgresAuditStorageMigrations,
  ...postgresEventPublicationMigrations,
  ...postgresChannelDeliveryMigrations,
  ...postgresScheduledCommandMigrations,
  ...postgresSecurityHardeningMigrations,
];
