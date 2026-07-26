import type { UserFollowRepositoryPort } from "../../../application/ports/outbound/user-follow.repository.port";

type FollowStore = Set<string>;

declare global {
  var __supportUserFollowStoreV1: Set<string> | undefined;
}

function getProcessStore(): Set<string> {
  globalThis.__supportUserFollowStoreV1 ??= new Set([
    "account_octocat:account_mock",
  ]);
  return globalThis.__supportUserFollowStoreV1;
}

function followKey(followerAccountId: string, followedAccountId: string) {
  return `${followerAccountId}:${followedAccountId}`;
}

export class InMemoryUserFollowAdapter implements UserFollowRepositoryPort {
  private readonly follows: FollowStore;

  constructor(follows: FollowStore = getProcessStore()) {
    this.follows = follows;
  }

  isFollowing(
    followerAccountId: string,
    followedAccountId: string,
  ): Promise<boolean> {
    return Promise.resolve(
      this.follows.has(followKey(followerAccountId, followedAccountId)),
    );
  }

  setFollowing(
    followerAccountId: string,
    followedAccountId: string,
    isFollowing: boolean,
  ): Promise<void> {
    const key = followKey(followerAccountId, followedAccountId);
    if (isFollowing) {
      this.follows.add(key);
    } else {
      this.follows.delete(key);
    }
    return Promise.resolve();
  }
}
