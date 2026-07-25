import type {
  GitHubAppInstallationPolicy,
  OAuthAppAccessRestriction,
} from "../../../domain/organization-app-access-policy";
import type { OrganizationAppAccessPolicyQueryRepositoryPort } from "../../../application/ports/outbound/organization-app-access-policy-query.repository.port";

export type InMemoryOrganizationAppAccessPolicyRecord = Readonly<{
  organizationId: string;
  oauthAppAccess: OAuthAppAccessRestriction;
  githubAppInstallation: GitHubAppInstallationPolicy;
}>;

export type InMemoryOrganizationAppAccessPolicyState = readonly InMemoryOrganizationAppAccessPolicyRecord[];

export class InMemoryOrganizationAppAccessPolicyQueryAdapter
  implements OrganizationAppAccessPolicyQueryRepositoryPort
{
  private readonly state: InMemoryOrganizationAppAccessPolicyState;

  constructor(state: InMemoryOrganizationAppAccessPolicyState = []) {
    this.state = state;
  }

  static createState(): InMemoryOrganizationAppAccessPolicyState {
    return [];
  }

  getOAuthAppAccessRestriction(
    organizationId: string,
  ): Promise<OAuthAppAccessRestriction | null> {
    return Promise.resolve(this.lookup(organizationId)?.oauthAppAccess ?? null);
  }

  getGitHubAppInstallationPolicy(
    organizationId: string,
  ): Promise<GitHubAppInstallationPolicy | null> {
    return Promise.resolve(
      this.lookup(organizationId)?.githubAppInstallation ?? null,
    );
  }

  private lookup(organizationId: string) {
    return this.state.find((entry) => entry.organizationId === organizationId);
  }
}
