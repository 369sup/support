import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type ListActivePublicRepositoriesForPersonalOwnerQuery = Readonly<{
  ownerAccountId: string;
}>;

export interface ListActivePublicRepositoriesForPersonalOwnerUseCase {
  listActivePublicRepositoriesForPersonalOwner(
    query: ListActivePublicRepositoriesForPersonalOwnerQuery,
  ): Promise<readonly RepositoryQuerySnapshot[]>;
}
