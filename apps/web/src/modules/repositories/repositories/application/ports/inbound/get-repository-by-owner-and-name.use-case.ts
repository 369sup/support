import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type GetRepositoryByOwnerAndNameQuery = Readonly<{
  ownerId: string;
  name: string;
}>;
export type GetRepositoryByOwnerAndNameResult =
  | Readonly<{ status: "found"; repository: RepositoryQuerySnapshot }>
  | Readonly<{ status: "repository-not-found" }>;

export interface GetRepositoryByOwnerAndNameUseCase {
  getRepositoryByOwnerAndName(
    query: GetRepositoryByOwnerAndNameQuery,
  ): Promise<GetRepositoryByOwnerAndNameResult>;
}
