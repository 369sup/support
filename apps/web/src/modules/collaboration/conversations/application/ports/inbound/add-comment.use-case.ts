import type {
  ConversationComment,
  ConversationSubjectKind,
} from "../../../domain/conversation-comment";

export type AddCommentCommand = Readonly<{
  subjectKind: ConversationSubjectKind;
  subjectId: string;
  actorAccountId: string;
  actorUsername: string;
  body: string;
  createdAt: string;
}>;

export type AddCommentResult =
  | Readonly<{ status: "added"; comment: ConversationComment }>
  | Readonly<{ status: "invalid-comment" }>
  | Readonly<{ status: "conversation-locked" }>;

export interface AddCommentUseCase {
  addComment(command: AddCommentCommand): Promise<AddCommentResult>;
}
