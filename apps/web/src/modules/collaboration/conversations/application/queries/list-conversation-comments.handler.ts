import type {
  ListConversationCommentsQuery,
  ListConversationCommentsResult,
  ListConversationCommentsUseCase,
} from "../ports/inbound/list-conversation-comments.use-case";
import type { ConversationRepositoryPort } from "../ports/outbound/conversation.repository.port";

export class ListConversationCommentsHandler
  implements ListConversationCommentsUseCase
{
  private readonly conversations: ConversationRepositoryPort;

  constructor(conversations: ConversationRepositoryPort) {
    this.conversations = conversations;
  }

  async listConversationComments(
    query: ListConversationCommentsQuery,
  ): Promise<ListConversationCommentsResult> {
    const subjectId = query.subjectId.trim();
    if (subjectId.length === 0) {
      return { status: "invalid-subject" };
    }

    const comments = await this.conversations.listComments(
      query.subjectKind,
      subjectId,
    );
    return {
      status: "found",
      comments: comments.toSorted((left, right) =>
        left.createdAt.localeCompare(right.createdAt),
      ),
    };
  }
}
