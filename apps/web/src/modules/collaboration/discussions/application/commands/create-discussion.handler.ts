import type { RepositoryDiscussion } from "../../domain/repository-discussion";
import type {
  CreateDiscussionCommand,
  CreateDiscussionResult,
  CreateDiscussionUseCase,
} from "../ports/inbound/create-discussion.use-case";
import type { DiscussionRepositoryPort } from "../ports/outbound/discussion.repository.port";

export class CreateDiscussionHandler implements CreateDiscussionUseCase {
  private readonly discussions: DiscussionRepositoryPort;

  constructor(discussions: DiscussionRepositoryPort) {
    this.discussions = discussions;
  }

  async createDiscussion(
    command: CreateDiscussionCommand,
  ): Promise<CreateDiscussionResult> {
    const repositoryId = command.repositoryId.trim();
    const title = command.title.trim();
    const body = command.body.trim();
    if (
      repositoryId === "" ||
      command.actorAccountId.trim() === "" ||
      command.actorUsername.trim() === "" ||
      title === "" ||
      body === ""
    ) {
      return { status: "invalid-discussion" };
    }
    const number = await this.discussions.nextNumber(repositoryId);
    const discussion: RepositoryDiscussion = {
      authorAccountId: command.actorAccountId,
      authorUsername: command.actorUsername,
      body,
      category: command.category,
      createdAt: command.createdAt,
      discussionId: `${repositoryId}_discussion_${number}`,
      number,
      repositoryId,
      state: "open",
      title,
      updatedAt: command.createdAt,
    };
    await this.discussions.insert(discussion);
    return { discussion, status: "created" };
  }
}
