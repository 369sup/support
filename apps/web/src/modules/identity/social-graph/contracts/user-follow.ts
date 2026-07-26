export type UserFollowState = Readonly<{
  followerAccountId: string;
  followedAccountId: string;
  isFollowing: boolean;
}>;
