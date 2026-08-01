export type RepositoryPermission =
  | "read"
  | "triage"
  | "write"
  | "maintain"
  | "admin";

export type RepositoryPermissionSource =
  | Readonly<{ kind: "public-read" }>
  | Readonly<{ kind: "personal-owner" }>
  | Readonly<{ kind: "organization-owner"; membershipId: string }>
  | Readonly<{ kind: "direct-grant"; grantId: string }>
  | Readonly<{
      kind: "team-grant";
      grantId: string;
      teamId: string;
      matchedTeamId: string;
      isInherited: boolean;
    }>
  | Readonly<{
      kind: "organization-role";
      assignmentId: string;
      roleKey: string;
      subject:
        | Readonly<{ kind: "account"; accountId: string }>
        | Readonly<{ kind: "team"; teamId: string }>;
    }>;

export type EffectiveRepositoryPermissionDecision = Readonly<{
  isAllowed: boolean;
  permission: RepositoryPermission | null;
  sources: readonly RepositoryPermissionSource[];
}>;

export type TeamRepositoryGrantReference = Readonly<{
  grantId: string;
  repositoryId: string;
  organizationId: string;
  teamId: string;
  permission: RepositoryPermission;
  state: "active" | "revoked";
}>;
