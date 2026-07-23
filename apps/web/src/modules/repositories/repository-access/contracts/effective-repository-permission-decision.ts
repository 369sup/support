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
  | Readonly<{ kind: "direct-grant"; grantId: string }>;

export type EffectiveRepositoryPermissionDecision = Readonly<{
  allowed: boolean;
  permission: RepositoryPermission | null;
  sources: readonly RepositoryPermissionSource[];
}>;
