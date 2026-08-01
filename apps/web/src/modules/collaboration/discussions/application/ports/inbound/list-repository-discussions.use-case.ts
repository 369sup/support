import type { RepositoryDiscussion } from "../../../domain/repository-discussion";

export type ListRepositoryDiscussionsResult = Readonly<{
  discussions: readonly RepositoryDiscussion[];
  status: "found";
}>;

export interface ListRepositoryDiscussionsUseCase {
  listRepositoryDiscussions(
    repositoryId: string,
  ): Promise<ListRepositoryDiscussionsResult>;
}
