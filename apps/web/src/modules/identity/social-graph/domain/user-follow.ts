export type UserFollowState = Readonly<{
  followedAccountId: string;
  followerAccountId: string;
  isFollowing: boolean;
}>;
