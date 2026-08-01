import type {
  ConversationComment,
  ConversationSubjectKind,
} from "../../../domain/conversation-comment";

export type ListConversationCommentsQuery = Readonly<{
  subjectKind: ConversationSubjectKind;
  subjectId: string;
}>;

export type ListConversationCommentsResult =
  | Readonly<{ status: "found"; comments: readonly ConversationComment[] }>
  | Readonly<{ status: "invalid-subject" }>;

export interface ListConversationCommentsUseCase {
  listConversationComments(
    query: ListConversationCommentsQuery,
  ): Promise<ListConversationCommentsResult>;
}
