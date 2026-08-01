import type { RepositoryListItem } from "./repository-view.types";

export type ListVisibleRepositoriesForOwnerQuery = Readonly<{
  actorAccountId: string;
  ownerId: string;
}>;

export interface ListVisibleRepositoriesForOwnerUseCase {
  listVisibleRepositoriesForOwner(
    query: ListVisibleRepositoriesForOwnerQuery,
  ): Promise<readonly RepositoryListItem[]>;
}
