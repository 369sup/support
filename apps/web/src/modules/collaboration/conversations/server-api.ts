import { conversationsServerFacade } from "./composition/conversations.composition";

export type {
  ConversationComment,
  ConversationReaction,
  ConversationSubjectKind,
} from "./contracts/conversation-comment";

export const addComment = conversationsServerFacade.addComment;
export const addReaction = conversationsServerFacade.addReaction;
export const listConversationComments =
  conversationsServerFacade.listConversationComments;
