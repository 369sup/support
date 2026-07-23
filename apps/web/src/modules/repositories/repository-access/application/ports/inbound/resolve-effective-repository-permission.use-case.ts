export type ResolveEffectiveRepositoryPermissionQuery = Readonly<{
  repository: Readonly<{
    repositoryId: string;
    owner:
      | Readonly<{ kind: "personal"; accountId: string }>
      | Readonly<{ kind: "organization"; organizationId: string }>;
    visibility: "public" | "private" | "internal";
  }>;
  accountId: string;
}>;

export type ResolveEffectiveRepositoryPermissionResult = Readonly<{
  allowed: boolean;
  permission: "read" | "triage" | "write" | "maintain" | "admin" | null;
  sources: readonly (
    | Readonly<{ kind: "public-read" }>
    | Readonly<{ kind: "personal-owner" }>
    | Readonly<{ kind: "organization-owner"; membershipId: string }>
    | Readonly<{ kind: "direct-grant"; grantId: string }>
  )[];
}>;

export interface ResolveEffectiveRepositoryPermissionUseCase {
  resolveEffectiveRepositoryPermission(
    query: ResolveEffectiveRepositoryPermissionQuery,
  ): Promise<ResolveEffectiveRepositoryPermissionResult>;
}
