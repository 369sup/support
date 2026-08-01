import { getProductionDatabase } from "../../../../../production-runtime";
import { PostgresConversationAdapter } from "../adapters/outbound/persistence/postgres-conversation.adapter";
import { AddCommentHandler } from "../application/commands/add-comment.handler";
import { AddReactionHandler } from "../application/commands/add-reaction.handler";
import type { AddCommentUseCase } from "../application/ports/inbound/add-comment.use-case";
import type { AddReactionUseCase } from "../application/ports/inbound/add-reaction.use-case";
import type { ListConversationCommentsUseCase } from "../application/ports/inbound/list-conversation-comments.use-case";
import { ListConversationCommentsHandler } from "../application/queries/list-conversation-comments.handler";

export type ConversationsServerFacade = Readonly<{
  addComment: AddCommentUseCase["addComment"];
  addReaction: AddReactionUseCase["addReaction"];
  listConversationComments:
    ListConversationCommentsUseCase["listConversationComments"];
}>;

function composeConversationsServerFacade(): ConversationsServerFacade {
  const conversations = new PostgresConversationAdapter(
    getProductionDatabase(),
  );
  const addComment = new AddCommentHandler(conversations);
  const addReaction = new AddReactionHandler(conversations);
  const listConversationComments =
    new ListConversationCommentsHandler(conversations);
  return {
    addComment: addComment.addComment.bind(addComment),
    addReaction: addReaction.addReaction.bind(addReaction),
    listConversationComments:
      listConversationComments.listConversationComments.bind(
        listConversationComments,
      ),
  };
}

export const conversationsServerFacade = composeConversationsServerFacade();
