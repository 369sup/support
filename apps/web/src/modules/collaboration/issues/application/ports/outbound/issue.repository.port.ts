import type { RepositoryIssue } from "../../../domain/repository-issue";

export interface IssueRepositoryPort {
  listByRepository(repositoryId: string): Promise<readonly RepositoryIssue[]>;
  findByRepositoryAndNumber(
    repositoryId: string,
    number: number,
  ): Promise<RepositoryIssue | null>;
  nextNumber(repositoryId: string): Promise<number>;
  insert(issue: RepositoryIssue): Promise<void>;
}
