import type {
  ConversationComment,
  ConversationReaction,
} from "../../../domain/conversation-comment";

export type AddReactionCommand = Readonly<{
  subjectId: string;
  commentId: string;
  actorAccountId: string;
  reaction: ConversationReaction;
}>;

export type AddReactionResult =
  | Readonly<{ status: "added"; comment: ConversationComment }>
  | Readonly<{ status: "comment-not-found" }>
  | Readonly<{ status: "duplicate-reaction" }>
  | Readonly<{ status: "invalid-reaction" }>;

export interface AddReactionUseCase {
  addReaction(command: AddReactionCommand): Promise<AddReactionResult>;
}
