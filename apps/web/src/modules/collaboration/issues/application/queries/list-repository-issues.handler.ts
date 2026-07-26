import type {
  ListRepositoryIssuesQuery,
  ListRepositoryIssuesResult,
  ListRepositoryIssuesUseCase,
} from "../ports/inbound/list-repository-issues.use-case";
import type { IssueRepositoryPort } from "../ports/outbound/issue.repository.port";

export class ListRepositoryIssuesHandler
  implements ListRepositoryIssuesUseCase
{
  private readonly issues: IssueRepositoryPort;

  constructor(issues: IssueRepositoryPort) {
    this.issues = issues;
  }

  async listRepositoryIssues(
    query: ListRepositoryIssuesQuery,
  ): Promise<ListRepositoryIssuesResult> {
    const repositoryId = query.repositoryId.trim();
    if (repositoryId.length === 0) {
      return { status: "invalid-repository-id" };
    }

    const issues = await this.issues.listByRepository(repositoryId);
    return {
      status: "found",
      issues: issues
        .filter((issue) => query.state === undefined || issue.state === query.state)
        .toSorted((left, right) => right.number - left.number),
    };
  }
}
