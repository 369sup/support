import type { UserFollowState } from "../../../domain/user-follow";

export type ToggleUserFollowCommand = Readonly<{
  followerAccountId: string;
  followedAccountId: string;
}>;

export type ToggleUserFollowResult =
  | Readonly<{ status: "updated"; follow: UserFollowState }>
  | Readonly<{ status: "invalid-follow" }>
  | Readonly<{ status: "self-follow-not-allowed" }>;

export interface ToggleUserFollowUseCase {
  toggleUserFollow(
    command: ToggleUserFollowCommand,
  ): Promise<ToggleUserFollowResult>;
}
