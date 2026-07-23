import type { EffectiveRepositoryPermissionDecision } from "../../../domain/repository-permission";

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
