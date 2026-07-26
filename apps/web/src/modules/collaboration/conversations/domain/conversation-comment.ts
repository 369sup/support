export type ConversationSubjectKind = "issue" | "discussion";
export type ConversationReaction = "thumbs-up" | "heart" | "hooray" | "eyes";
export type ConversationComment = Readonly<{
  authorAccountId: string;
  authorUsername: string;
  body: string;
  commentId: string;
  createdAt: string;
  reactions: Readonly<Record<ConversationReaction, number>>;
  subjectId: string;
  subjectKind: ConversationSubjectKind;
}>;
