import type {
  ConversationComment,
  ConversationReaction,
  ConversationSubjectKind,
} from "../../../domain/conversation-comment";

export interface ConversationRepositoryPort {
  listComments(
    subjectKind: ConversationSubjectKind,
    subjectId: string,
  ): Promise<readonly ConversationComment[]>;
  isLocked(
    subjectKind: ConversationSubjectKind,
    subjectId: string,
  ): Promise<boolean>;
  nextCommentId(subjectId: string): Promise<string>;
  insertComment(comment: ConversationComment): Promise<void>;
  findComment(
    subjectId: string,
    commentId: string,
  ): Promise<ConversationComment | null>;
  hasReaction(
    commentId: string,
    actorAccountId: string,
    reaction: ConversationReaction,
  ): Promise<boolean>;
  addReaction(
    comment: ConversationComment,
    actorAccountId: string,
    reaction: ConversationReaction,
  ): Promise<ConversationComment>;
}
