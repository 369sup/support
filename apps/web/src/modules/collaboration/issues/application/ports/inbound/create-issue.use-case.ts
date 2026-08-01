import type { RepositoryIssue } from "../../../domain/repository-issue";

export type CreateIssueCommand = Readonly<{
  repositoryId: string;
  actorAccountId: string;
  actorUsername: string;
  title: string;
  body: string;
  createdAt: string;
}>;

export type CreateIssueResult =
  | Readonly<{ status: "created"; issue: RepositoryIssue }>
  | Readonly<{ status: "invalid-issue" }>;

export interface CreateIssueUseCase {
  createIssue(command: CreateIssueCommand): Promise<CreateIssueResult>;
}
