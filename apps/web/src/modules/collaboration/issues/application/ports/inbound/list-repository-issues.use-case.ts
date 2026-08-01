import type {
  RepositoryIssue,
  RepositoryIssueState,
} from "../../../domain/repository-issue";

export type ListRepositoryIssuesQuery = Readonly<{
  repositoryId: string;
  state?: RepositoryIssueState;
}>;

export type ListRepositoryIssuesResult =
  | Readonly<{ status: "found"; issues: readonly RepositoryIssue[] }>
  | Readonly<{ status: "invalid-repository-id" }>;

export interface ListRepositoryIssuesUseCase {
  listRepositoryIssues(
    query: ListRepositoryIssuesQuery,
  ): Promise<ListRepositoryIssuesResult>;
}
