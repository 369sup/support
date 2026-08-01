import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { UserFollowRepositoryPort } from "../../../application/ports/outbound/user-follow.repository.port";

type FollowRow = SqlRow & {
  isFollowing: boolean;
};

export class PostgresUserFollowAdapter implements UserFollowRepositoryPort {
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async isFollowing(
    followerAccountId: string,
    followedAccountId: string,
  ): Promise<boolean> {
    const result = await this.database.query<FollowRow>(
      `
        select exists (
          select 1
          from support_identity_social_graph.support_user_follows
          where follower_account_id = $1
            and followed_account_id = $2
        ) as "isFollowing"
      `,
      [followerAccountId, followedAccountId],
    );
    return result.rows[0]?.isFollowing ?? false;
  }

  async setFollowing(
    followerAccountId: string,
    followedAccountId: string,
    isFollowing: boolean,
  ): Promise<void> {
    if (isFollowing) {
      await this.database.query(
        `
          insert into support_identity_social_graph.support_user_follows (
            follower_account_id,
            followed_account_id
          ) values ($1, $2)
          on conflict (follower_account_id, followed_account_id) do nothing
        `,
        [followerAccountId, followedAccountId],
      );
      return;
    }
    await this.database.query(
      `
        delete from support_identity_social_graph.support_user_follows
        where follower_account_id = $1
          and followed_account_id = $2
      `,
      [followerAccountId, followedAccountId],
    );
  }
}
