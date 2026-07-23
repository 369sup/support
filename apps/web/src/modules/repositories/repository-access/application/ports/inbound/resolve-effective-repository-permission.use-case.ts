import type { EffectiveRepositoryPermissionDecision } from "../../../contracts/effective-repository-permission-decision";

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

export type ResolveEffectiveRepositoryPermissionResult =
  EffectiveRepositoryPermissionDecision;

export interface ResolveEffectiveRepositoryPermissionUseCase {
  resolveEffectiveRepositoryPermission(
    query: ResolveEffectiveRepositoryPermissionQuery,
  ): Promise<ResolveEffectiveRepositoryPermissionResult>;
}
