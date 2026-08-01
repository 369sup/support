import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type ListActivePublicRepositoriesForOrganizationOwnerQuery = Readonly<{
  ownerOrganizationId: string;
}>;

export interface ListActivePublicRepositoriesForOrganizationOwnerUseCase {
  listActivePublicRepositoriesForOrganizationOwner(
    query: ListActivePublicRepositoriesForOrganizationOwnerQuery,
  ): Promise<readonly RepositoryQuerySnapshot[]>;
}
