export type PredefinedOrganizationRoleKey =
  | "moderator"
  | "security-manager"
  | "ci-cd-admin"
  | "app-manager"
  | "all-repository-read"
  | "all-repository-triage"
  | "all-repository-write"
  | "all-repository-maintain"
  | "all-repository-admin";

export type OrganizationPermission =
  | "moderate-organization"
  | "manage-security"
  | "manage-ci-cd"
  | "manage-app-registrations";

export type OrganizationRepositoryPermission =
  | "read"
  | "triage"
  | "write"
  | "maintain"
  | "admin";

export type PredefinedOrganizationRoleDefinition = Readonly<{
  roleKey: PredefinedOrganizationRoleKey;
  displayName: string;
  description: string;
  organizationPermissions: readonly OrganizationPermission[];
  repositoryPermission: OrganizationRepositoryPermission | null;
}>;

export type OrganizationRoleAssignmentSubject =
  | Readonly<{ kind: "account"; accountId: string }>
  | Readonly<{ kind: "team"; teamId: string }>;

export type OrganizationRoleAssignmentReference = Readonly<{
  assignmentId: string;
  organizationId: string;
  roleKey: PredefinedOrganizationRoleKey;
  subject: OrganizationRoleAssignmentSubject;
  state: "active" | "revoked";
}>;

export type OrganizationRepositoryRoleContribution = Readonly<{
  assignmentId: string;
  roleKey: PredefinedOrganizationRoleKey;
  subject: OrganizationRoleAssignmentSubject;
  permission: OrganizationRepositoryPermission;
}>;
