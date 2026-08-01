import type {
  ToggleUserFollowCommand,
  ToggleUserFollowResult,
  ToggleUserFollowUseCase,
} from "../ports/inbound/toggle-user-follow.use-case";
import type { UserFollowRepositoryPort } from "../ports/outbound/user-follow.repository.port";

export class ToggleUserFollowHandler implements ToggleUserFollowUseCase {
  private readonly follows: UserFollowRepositoryPort;

  constructor(follows: UserFollowRepositoryPort) {
    this.follows = follows;
  }

  async toggleUserFollow(
    command: ToggleUserFollowCommand,
  ): Promise<ToggleUserFollowResult> {
    const followerAccountId = command.followerAccountId.trim();
    const followedAccountId = command.followedAccountId.trim();
    if (followerAccountId.length === 0 || followedAccountId.length === 0) {
      return { status: "invalid-follow" };
    }
    if (followerAccountId === followedAccountId) {
      return { status: "self-follow-not-allowed" };
    }

    const isFollowing = !(
      await this.follows.isFollowing(followerAccountId, followedAccountId)
    );
    await this.follows.setFollowing(
      followerAccountId,
      followedAccountId,
      isFollowing,
    );
    return {
      status: "updated",
      follow: { followerAccountId, followedAccountId, isFollowing },
    };
  }
}
