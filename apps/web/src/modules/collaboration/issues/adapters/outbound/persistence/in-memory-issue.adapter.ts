import type { IssueRepositoryPort } from "../../../application/ports/outbound/issue.repository.port";
import type { RepositoryIssue } from "../../../contracts/repository-issue";

const developmentIssues: readonly RepositoryIssue[] = [
  {
    issueId: "repository_support_issue_1",
    repositoryId: "repository_support",
    number: 1,
    title: "Design the contributor notification inbox",
    body: "Define a permission-aware inbox for issue and discussion activity.",
    state: "open",
    authorAccountId: "account_octocat",
    authorUsername: "octocat",
    createdAt: "2026-07-20T08:00:00.000Z",
    updatedAt: "2026-07-24T10:30:00.000Z",
  },
  {
    issueId: "repository_support_issue_2",
    repositoryId: "repository_support",
    number: 2,
    title: "Document the non-code product boundary",
    body: "Keep Git content, pull requests, reviews, and Actions excluded.",
    state: "closed",
    authorAccountId: "account_mock",
    authorUsername: "mock",
    createdAt: "2026-07-21T09:00:00.000Z",
    updatedAt: "2026-07-25T12:00:00.000Z",
  },
];

type IssueStore = Map<string, RepositoryIssue>;

declare global {
  var __supportIssueStoreV1: IssueStore | undefined;
}

function issueKey(repositoryId: string, number: number): string {
  return `${repositoryId}:${number}`;
}

function createStore(issues = developmentIssues): IssueStore {
  return new Map(
    issues.map((issue) => [issueKey(issue.repositoryId, issue.number), issue]),
  );
}

function getProcessStore(): IssueStore {
  globalThis.__supportIssueStoreV1 ??= createStore();
  return globalThis.__supportIssueStoreV1;
}

export class InMemoryIssueAdapter implements IssueRepositoryPort {
  private readonly issues: IssueStore;

  constructor(issues: IssueStore = getProcessStore()) {
    this.issues = issues;
  }

  listByRepository(repositoryId: string): Promise<readonly RepositoryIssue[]> {
    return Promise.resolve(
      [...this.issues.values()].filter(
        (issue) => issue.repositoryId === repositoryId,
      ),
    );
  }

  findByRepositoryAndNumber(
    repositoryId: string,
    number: number,
  ): Promise<RepositoryIssue | null> {
    return Promise.resolve(this.issues.get(issueKey(repositoryId, number)) ?? null);
  }

  async nextNumber(repositoryId: string): Promise<number> {
    const issues = await this.listByRepository(repositoryId);
    return issues.reduce((highest, issue) => Math.max(highest, issue.number), 0) + 1;
  }

  insert(issue: RepositoryIssue): Promise<void> {
    this.issues.set(issueKey(issue.repositoryId, issue.number), issue);
    return Promise.resolve();
  }
}
