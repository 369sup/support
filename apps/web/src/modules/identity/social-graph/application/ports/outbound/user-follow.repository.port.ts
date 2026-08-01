export interface UserFollowRepositoryPort {
  isFollowing(
    followerAccountId: string,
    followedAccountId: string,
  ): Promise<boolean>;
  setFollowing(
    followerAccountId: string,
    followedAccountId: string,
    isFollowing: boolean,
  ): Promise<void>;
}
