import type { ConversationComment } from "../../domain/conversation-comment";
import type {
  AddCommentCommand,
  AddCommentResult,
  AddCommentUseCase,
} from "../ports/inbound/add-comment.use-case";
import type { ConversationRepositoryPort } from "../ports/outbound/conversation.repository.port";

const emptyReactions = {
  "thumbs-up": 0,
  heart: 0,
  hooray: 0,
  eyes: 0,
} as const;

export class AddCommentHandler implements AddCommentUseCase {
  private readonly conversations: ConversationRepositoryPort;

  constructor(conversations: ConversationRepositoryPort) {
    this.conversations = conversations;
  }

  async addComment(command: AddCommentCommand): Promise<AddCommentResult> {
    const body = command.body.trim();
    if (
      command.subjectId.trim().length === 0 ||
      command.actorAccountId.trim().length === 0 ||
      command.actorUsername.trim().length === 0 ||
      body.length === 0
    ) {
      return { status: "invalid-comment" };
    }

    if (
      await this.conversations.isLocked(command.subjectKind, command.subjectId)
    ) {
      return { status: "conversation-locked" };
    }

    const comment: ConversationComment = {
      commentId: await this.conversations.nextCommentId(command.subjectId),
      subjectKind: command.subjectKind,
      subjectId: command.subjectId,
      authorAccountId: command.actorAccountId,
      authorUsername: command.actorUsername,
      body,
      createdAt: command.createdAt,
      reactions: emptyReactions,
    };
    await this.conversations.insertComment(comment);
    return { status: "added", comment };
  }
}
