import type { RepositoryIssue } from "../../domain/repository-issue";
import type {
  CreateIssueCommand,
  CreateIssueResult,
  CreateIssueUseCase,
} from "../ports/inbound/create-issue.use-case";
import type { IssueRepositoryPort } from "../ports/outbound/issue.repository.port";

export class CreateIssueHandler implements CreateIssueUseCase {
  private readonly issues: IssueRepositoryPort;

  constructor(issues: IssueRepositoryPort) {
    this.issues = issues;
  }

  async createIssue(command: CreateIssueCommand): Promise<CreateIssueResult> {
    const repositoryId = command.repositoryId.trim();
    const title = command.title.trim();
    const body = command.body.trim();
    if (
      repositoryId.length === 0 ||
      command.actorAccountId.trim().length === 0 ||
      command.actorUsername.trim().length === 0 ||
      title.length === 0 ||
      body.length === 0
    ) {
      return { status: "invalid-issue" };
    }

    const number = await this.issues.nextNumber(repositoryId);
    const issue: RepositoryIssue = {
      issueId: `${repositoryId}_issue_${number}`,
      repositoryId,
      number,
      title,
      body,
      state: "open",
      authorAccountId: command.actorAccountId,
      authorUsername: command.actorUsername,
      createdAt: command.createdAt,
      updatedAt: command.createdAt,
    };
    await this.issues.insert(issue);
    return { status: "created", issue };
  }
}
