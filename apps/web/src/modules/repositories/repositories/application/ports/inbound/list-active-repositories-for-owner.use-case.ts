import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type ListActiveRepositoriesForOwnerQuery = Readonly<{
  ownerId: string;
}>;

export interface ListActiveRepositoriesForOwnerUseCase {
  listActiveRepositoriesForOwner(
    query: ListActiveRepositoriesForOwnerQuery,
  ): Promise<readonly RepositoryQuerySnapshot[]>;
}
