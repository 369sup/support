import type { RepositoryStargazer } from "../../../domain/repository-star";

export type ListRepositoryStargazersResult =
  | Readonly<{ status: "found"; stargazers: readonly RepositoryStargazer[] }>
  | Readonly<{ status: "invalid-repository-id" }>;

export interface ListRepositoryStargazersUseCase {
  listRepositoryStargazers(
    repositoryId: string,
  ): Promise<ListRepositoryStargazersResult>;
}
