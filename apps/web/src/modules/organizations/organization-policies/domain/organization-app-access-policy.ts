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

export type BaseRepositoryPermission =
  | "read"
  | "triage"
  | "write"
  | "maintain"
  | "admin";
