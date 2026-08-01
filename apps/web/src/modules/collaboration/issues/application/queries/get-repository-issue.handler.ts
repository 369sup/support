import type {
  GetRepositoryIssueQuery,
  GetRepositoryIssueResult,
  GetRepositoryIssueUseCase,
} from "../ports/inbound/get-repository-issue.use-case";
import type { IssueRepositoryPort } from "../ports/outbound/issue.repository.port";

export class GetRepositoryIssueHandler implements GetRepositoryIssueUseCase {
  private readonly issues: IssueRepositoryPort;

  constructor(issues: IssueRepositoryPort) {
    this.issues = issues;
  }

  async getRepositoryIssue(
    query: GetRepositoryIssueQuery,
  ): Promise<GetRepositoryIssueResult> {
    if (!Number.isInteger(query.number) || query.number < 1) {
      return { status: "invalid-issue-number" };
    }

    const issue = await this.issues.findByRepositoryAndNumber(
      query.repositoryId,
      query.number,
    );
    return issue === null
      ? { status: "issue-not-found" }
      : { status: "found", issue };
  }
}
