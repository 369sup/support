import type { DeletedRepositoryForRestoration } from "./repository-view.types";

export type ListDeletedRepositoriesForRestorationQuery = Readonly<{
  actorAccountId: string;
  ownerId: string;
}>;

export type ListDeletedRepositoriesForRestorationResult =
  | Readonly<{
      status: "found";
      repositories: readonly DeletedRepositoryForRestoration[];
    }>
  | Readonly<{ status: "permission-denied" }>;

export interface ListDeletedRepositoriesForRestorationUseCase {
  listDeletedRepositoriesForRestoration(
    query: ListDeletedRepositoriesForRestorationQuery,
  ): Promise<ListDeletedRepositoriesForRestorationResult>;
}
