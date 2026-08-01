import type { SqlExecutor, SqlRow } from "@support/database/postgres";

import type { OrganizationAppAccessPolicyQueryRepositoryPort } from "../../../application/ports/outbound/organization-app-access-policy-query.repository.port";
import type {
  BaseRepositoryPermission,
  GitHubAppInstallationPolicy,
  OAuthAppAccessRestriction,
} from "../../../domain/organization-app-access-policy";

type PolicyRow = SqlRow & {
  organization_id: string;
  base_repository_permission: BaseRepositoryPermission | null;
  isOutsideCollaboratorOauthAllowed: boolean;
  allowed_oauth_scopes: string[];
  isOutsideCollaboratorGithubAppAllowed: boolean;
  isOwnerApprovalRequiredForAdditionalPermissions: boolean;
};

const columns =
  `organization_id,
   base_repository_permission,
   outside_collaborator_oauth_allowed as "isOutsideCollaboratorOauthAllowed",
   allowed_oauth_scopes,
   outside_collaborator_github_app_allowed as "isOutsideCollaboratorGithubAppAllowed",
   owner_approval_required_for_additional_permissions as "isOwnerApprovalRequiredForAdditionalPermissions"`;

export class PostgresOrganizationPolicyQueryAdapter
  implements OrganizationAppAccessPolicyQueryRepositoryPort
{
  private readonly database: SqlExecutor;
  private readonly isSchemaReady: Promise<void>;

  constructor(database: SqlExecutor) {
    this.database = database;
    this.isSchemaReady = this.assertSchema();
  }

  private async assertSchema() {
    const result = await this.database.query<{ isReady: boolean }>(
      `select exists (
         select 1 from support_schema_migrations
         where migration_id = 'zz047_organizations_organization_policies'
       ) as "isReady"`,
    );
    if (result.rows[0]?.isReady !== true) {
      throw new Error("Organization policy schema is unavailable.");
    }
  }

  private async lookup(organizationId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<PolicyRow>(
      `select ${columns} from support_organization_policies
        where organization_id = $1`,
      [organizationId],
    );
    return result.rows[0] ?? null;
  }

  async getBaseRepositoryPermission(organizationId: string) {
    return (await this.lookup(organizationId))?.base_repository_permission ?? null;
  }

  async getOAuthAppAccessRestriction(
    organizationId: string,
  ): Promise<OAuthAppAccessRestriction | null> {
    const row = await this.lookup(organizationId);
    return row === null
      ? null
      : {
          organizationId: row.organization_id,
          isOutsideCollaboratorAllowed:
            row.isOutsideCollaboratorOauthAllowed,
          allowedScopes: row.allowed_oauth_scopes,
        };
  }

  async getGitHubAppInstallationPolicy(
    organizationId: string,
  ): Promise<GitHubAppInstallationPolicy | null> {
    const row = await this.lookup(organizationId);
    return row === null
      ? null
      : {
          organizationId: row.organization_id,
          isOutsideCollaboratorAllowed:
            row.isOutsideCollaboratorGithubAppAllowed,
          hasOwnerApprovalRequiredForAdditionalPermissions:
            row.isOwnerApprovalRequiredForAdditionalPermissions,
        };
  }
}
