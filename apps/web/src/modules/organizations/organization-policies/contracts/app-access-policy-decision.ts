export type OAuthAppAccessRestriction = Readonly<{
  organizationId: string;
  isOutsideCollaboratorAllowed: boolean;
  allowedScopes: readonly string[];
}>;

export type OAuthPolicyConstraints = OAuthAppAccessRestriction;

export type GitHubAppInstallationPolicy = Readonly<{
  organizationId: string;
  isOutsideCollaboratorAllowed: boolean;
  hasOwnerApprovalRequiredForAdditionalPermissions: boolean;
}>;

export type AppAccessRequestPolicy = Readonly<{
  organizationId: string;
  oauthAppAccess: OAuthAppAccessRestriction;
  githubAppInstallation: GitHubAppInstallationPolicy;
}>;

export type ActorMembershipScope = "member" | "outside-collaborator";

export type AppAccessScope = "oauth-authorization" | "github-app-installation";

export type AppAccessRequest =
  | Readonly<{
      kind: "oauth-authorization";
      organizationId: string;
      scope: AppAccessScope;
      actorMembership: ActorMembershipScope;
      requestedScopes: readonly string[];
    }>
  | Readonly<{
      kind: "github-app-installation";
      organizationId: string;
      scope: AppAccessScope;
      actorMembership: ActorMembershipScope;
      requestedAdditionalPermissions: readonly string[];
      hasOwnerApproval: boolean;
    }>;

export type AppAccessDecisionStatus =
  | Readonly<{
      status: "allowed";
      policy: AppAccessRequestPolicy;
    }>
  | Readonly<{
      status: "denied";
      reason:
        | "outside-collaborator-blocked"
        | "scope-restricted"
        | "owner-approval-required";
      policy: AppAccessRequestPolicy;
      details?: Readonly<{
        deniedScopes?: readonly string[];
      }>;
    }>;

export type AppAccessPolicyDecision = AppAccessDecisionStatus;

export type BaseRepositoryPermission =
  | "read"
  | "triage"
  | "write"
  | "maintain"
  | "admin";
