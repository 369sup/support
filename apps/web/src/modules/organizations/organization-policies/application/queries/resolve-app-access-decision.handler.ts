import type {
  AppAccessPolicyDecision,
  AppAccessRequest,
  AppAccessRequestPolicy,
  ActorMembershipScope,
} from "../ports/inbound/resolve-app-access-decision.use-case";
import type { ResolveAppAccessDecisionUseCase } from "../ports/inbound/resolve-app-access-decision.use-case";
import type { OrganizationAppAccessPolicyQueryRepositoryPort } from "../ports/outbound/organization-app-access-policy-query.repository.port";
import {
  buildDefaultGitHubAppInstallationPolicy,
  buildDefaultOAuthAppAccessRestriction,
} from "../../domain/organization-app-access-policy";

const isOutsideCollaborationBlocked = (
  actorMembership: ActorMembershipScope,
  isOutsideCollaboratorAllowed: boolean,
): boolean =>
  actorMembership === "outside-collaborator" &&
  !isOutsideCollaboratorAllowed;

const isOwnerApprovalRequired = (
  requestedAdditionalPermissions: readonly string[],
  hasOwnerApproval: boolean,
  hasOwnerApprovalRequiredForAdditionalPermissions: boolean,
): boolean =>
  requestedAdditionalPermissions.length > 0 &&
  !hasOwnerApproval &&
  hasOwnerApprovalRequiredForAdditionalPermissions;

const isScopeRestricted = (
  requestedScopes: readonly string[],
  allowedScopes: readonly string[],
): string[] => {
  if (requestedScopes.length === 0 || allowedScopes.length === 0) {
    return [];
  }

  return requestedScopes.filter((scope) => !allowedScopes.includes(scope));
};

const createFallbackPolicy = (organizationId: string): AppAccessRequestPolicy => ({
  organizationId,
  oauthAppAccess: buildDefaultOAuthAppAccessRestriction(organizationId),
  githubAppInstallation: buildDefaultGitHubAppInstallationPolicy(
    organizationId,
  ),
});

export class ResolveAppAccessDecisionHandler
  implements ResolveAppAccessDecisionUseCase
{
  private readonly policyRepository: OrganizationAppAccessPolicyQueryRepositoryPort;

  constructor(policyRepository: OrganizationAppAccessPolicyQueryRepositoryPort) {
    this.policyRepository = policyRepository;
  }

  async resolveAppAccessDecision(
    query: AppAccessRequest,
  ): Promise<AppAccessPolicyDecision> {
    const fallback = createFallbackPolicy(query.organizationId);

    if (query.kind === "oauth-authorization") {
      const policy =
        (await this.policyRepository.getOAuthAppAccessRestriction(
          query.organizationId,
        )) ?? fallback.oauthAppAccess;

      if (
        isOutsideCollaborationBlocked(
          query.actorMembership,
          policy.isOutsideCollaboratorAllowed,
        )
      ) {
        return {
          status: "denied",
          reason: "outside-collaborator-blocked",
          policy: { ...fallback, oauthAppAccess: policy },
        };
      }

      const deniedScopes = isScopeRestricted(
        query.requestedScopes,
        policy.allowedScopes,
      );

      if (deniedScopes.length > 0) {
        return {
          status: "denied",
          reason: "scope-restricted",
          details: {
            deniedScopes,
          },
          policy: { ...fallback, oauthAppAccess: policy },
        };
      }

      return {
        status: "allowed",
        policy: { ...fallback, oauthAppAccess: policy },
      };
    }

    const policy =
      (await this.policyRepository.getGitHubAppInstallationPolicy(
        query.organizationId,
      )) ?? fallback.githubAppInstallation;

    if (
      isOutsideCollaborationBlocked(
        query.actorMembership,
        policy.isOutsideCollaboratorAllowed,
      )
    ) {
      return {
        status: "denied",
        reason: "outside-collaborator-blocked",
        policy: { ...fallback, githubAppInstallation: policy },
      };
    }

    if (
      isOwnerApprovalRequired(
        query.requestedAdditionalPermissions,
        query.hasOwnerApproval,
        policy.hasOwnerApprovalRequiredForAdditionalPermissions,
      )
    ) {
      return {
        status: "denied",
        reason: "owner-approval-required",
        policy: { ...fallback, githubAppInstallation: policy },
      };
    }

    return {
      status: "allowed",
      policy: { ...fallback, githubAppInstallation: policy },
    };
  }
}
