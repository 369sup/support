import type {
  BaseRepositoryPermission,
  GitHubAppInstallationPolicy,
  OAuthAppAccessRestriction,
} from "../../../domain/organization-app-access-policy";

export interface OrganizationAppAccessPolicyQueryRepositoryPort {
  getBaseRepositoryPermission(
    organizationId: string,
  ): Promise<BaseRepositoryPermission | null>;

  getOAuthAppAccessRestriction(
    organizationId: string,
  ): Promise<OAuthAppAccessRestriction | null>;

  getGitHubAppInstallationPolicy(
    organizationId: string,
  ): Promise<GitHubAppInstallationPolicy | null>;
}
