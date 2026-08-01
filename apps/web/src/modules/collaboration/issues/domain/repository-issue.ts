export type RepositoryIssueState = "open" | "closed";
export type RepositoryIssue = Readonly<{
  authorAccountId: string;
  authorUsername: string;
  body: string;
  createdAt: string;
  issueId: string;
  number: number;
  repositoryId: string;
  state: RepositoryIssueState;
  title: string;
  updatedAt: string;
}>;
