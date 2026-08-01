import type { RepositoryStargazer } from "../../../domain/repository-star";

export interface RepositoryStarRepositoryPort {
  find(
    repositoryId: string,
    accountId: string,
  ): Promise<RepositoryStargazer | null>;
  list(repositoryId: string): Promise<readonly RepositoryStargazer[]>;
  insert(repositoryId: string, stargazer: RepositoryStargazer): Promise<void>;
  remove(repositoryId: string, accountId: string): Promise<void>;
}
