import type { RepositoryDiscussion } from "../../../domain/repository-discussion";

export type GetRepositoryDiscussionQuery = Readonly<{
  number: number;
  repositoryId: string;
}>;

export type GetRepositoryDiscussionResult =
  | Readonly<{ discussion: RepositoryDiscussion; status: "found" }>
  | Readonly<{ status: "discussion-not-found" }>;

export interface GetRepositoryDiscussionUseCase {
  getRepositoryDiscussion(
    query: GetRepositoryDiscussionQuery,
  ): Promise<GetRepositoryDiscussionResult>;
}
