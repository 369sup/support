import type { RepositoryIssue } from "../../../domain/repository-issue";

export type GetRepositoryIssueQuery = Readonly<{
  repositoryId: string;
  number: number;
}>;

export type GetRepositoryIssueResult =
  | Readonly<{ status: "found"; issue: RepositoryIssue }>
  | Readonly<{ status: "invalid-issue-number" }>
  | Readonly<{ status: "issue-not-found" }>;

export interface GetRepositoryIssueUseCase {
  getRepositoryIssue(
    query: GetRepositoryIssueQuery,
  ): Promise<GetRepositoryIssueResult>;
}
