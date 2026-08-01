export type ConversationSubjectKind = "issue" | "discussion";
export type ConversationReaction = "thumbs-up" | "heart" | "hooray" | "eyes";

export type ConversationComment = Readonly<{
  commentId: string;
  subjectKind: ConversationSubjectKind;
  subjectId: string;
  authorAccountId: string;
  authorUsername: string;
  body: string;
  createdAt: string;
  reactions: Readonly<Record<ConversationReaction, number>>;
}>;
