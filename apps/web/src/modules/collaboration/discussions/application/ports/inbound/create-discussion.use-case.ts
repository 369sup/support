import type {
  DiscussionCategory,
  RepositoryDiscussion,
} from "../../../domain/repository-discussion";

export type CreateDiscussionCommand = Readonly<{
  actorAccountId: string;
  actorUsername: string;
  body: string;
  category: DiscussionCategory;
  createdAt: string;
  repositoryId: string;
  title: string;
}>;

export type CreateDiscussionResult =
  | Readonly<{ discussion: RepositoryDiscussion; status: "created" }>
  | Readonly<{ status: "invalid-discussion" }>;

export interface CreateDiscussionUseCase {
  createDiscussion(
    command: CreateDiscussionCommand,
  ): Promise<CreateDiscussionResult>;
}
