export type RepositoryIssueState = "open" | "closed";

export type RepositoryIssue = Readonly<{
  issueId: string;
  repositoryId: string;
  number: number;
  title: string;
  body: string;
  state: RepositoryIssueState;
  authorAccountId: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
}>;
