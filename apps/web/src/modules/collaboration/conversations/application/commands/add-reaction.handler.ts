import type {
  ConversationReaction,
} from "../../domain/conversation-comment";
import type {
  AddReactionCommand,
  AddReactionResult,
  AddReactionUseCase,
} from "../ports/inbound/add-reaction.use-case";
import type { ConversationRepositoryPort } from "../ports/outbound/conversation.repository.port";

const supportedReactions = new Set<ConversationReaction>([
  "thumbs-up",
  "heart",
  "hooray",
  "eyes",
]);

export class AddReactionHandler implements AddReactionUseCase {
  private readonly conversations: ConversationRepositoryPort;

  constructor(conversations: ConversationRepositoryPort) {
    this.conversations = conversations;
  }

  async addReaction(command: AddReactionCommand): Promise<AddReactionResult> {
    if (!supportedReactions.has(command.reaction)) {
      return { status: "invalid-reaction" };
    }

    const comment = await this.conversations.findComment(
      command.subjectId,
      command.commentId,
    );
    if (comment === null) {
      return { status: "comment-not-found" };
    }

    if (
      await this.conversations.hasReaction(
        comment.commentId,
        command.actorAccountId,
        command.reaction,
      )
    ) {
      return { status: "duplicate-reaction" };
    }

    return {
      status: "added",
      comment: await this.conversations.addReaction(
        comment,
        command.actorAccountId,
        command.reaction,
      ),
    };
  }
}
