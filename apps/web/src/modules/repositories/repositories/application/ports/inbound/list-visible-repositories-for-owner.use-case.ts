import type { RepositoryListItem } from "./repository-view.types";

export type ListVisibleRepositoriesForOwnerQuery = Readonly<{
  actorAccountId: string | null;
  ownerId: string;
}>;

export interface ListVisibleRepositoriesForOwnerUseCase {
  listVisibleRepositoriesForOwner(
    query: ListVisibleRepositoriesForOwnerQuery,
  ): Promise<readonly RepositoryListItem[]>;
}
