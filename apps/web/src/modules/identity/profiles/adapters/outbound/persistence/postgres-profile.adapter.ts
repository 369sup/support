import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { ProfileRepositoryPort } from "../../../application/ports/outbound/profile.repository.port";
import type {
  ProfileAchievement,
  ProfileStatus,
  UserProfile,
} from "../../../contracts/user-profile";

type ProfileRow = SqlRow & {
  account_id: string;
  achievements: unknown;
  bio: string;
  display_name: string;
  location: string;
  pinned_items: unknown;
  pronouns: string;
  status: unknown;
  visibility: UserProfile["visibility"];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseStatus(value: unknown): ProfileStatus | null {
  if (value === null) {
    return null;
  }
  if (
    !isRecord(value) ||
    typeof value["emoji"] !== "string" ||
    typeof value["message"] !== "string" ||
    typeof value["isBusy"] !== "boolean"
  ) {
    throw new Error("The stored profile status is invalid.");
  }
  return {
    emoji: value["emoji"],
    message: value["message"],
    isBusy: value["isBusy"],
  };
}

function parsePinnedItems(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error("The stored pinned profile items are invalid.");
  }
  const items: readonly unknown[] = value;
  return items.map((item) => {
    if (typeof item !== "string") {
      throw new Error("The stored pinned profile items are invalid.");
    }
    return item;
  });
}

function isAchievementTier(
  value: unknown,
): value is ProfileAchievement["tier"] {
  return (
    value === "base" ||
    value === "bronze" ||
    value === "silver" ||
    value === "gold"
  );
}

function parseAchievements(value: unknown): readonly ProfileAchievement[] {
  if (!Array.isArray(value)) {
    throw new Error("The stored profile achievements are invalid.");
  }
  const achievements: readonly unknown[] = value;
  return achievements.map((achievement) => {
    if (
      !isRecord(achievement) ||
      typeof achievement["slug"] !== "string" ||
      typeof achievement["title"] !== "string" ||
      typeof achievement["description"] !== "string" ||
      !isAchievementTier(achievement["tier"]) ||
      typeof achievement["isVisible"] !== "boolean"
    ) {
      throw new Error("The stored profile achievements are invalid.");
    }
    return {
      description: achievement["description"],
      isVisible: achievement["isVisible"],
      slug: achievement["slug"],
      tier: achievement["tier"],
      title: achievement["title"],
    };
  });
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    accountId: row.account_id,
    displayName: row.display_name,
    bio: row.bio,
    location: row.location,
    pronouns: row.pronouns,
    visibility: row.visibility,
    status: parseStatus(row.status),
    pinnedItems: parsePinnedItems(row.pinned_items),
    achievements: parseAchievements(row.achievements),
  };
}

export class PostgresProfileAdapter implements ProfileRepositoryPort {
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async findByAccountId(accountId: string): Promise<UserProfile | null> {
    const result = await this.database.query<ProfileRow>(
      `
        select
          account_id,
          display_name,
          bio,
          location,
          pronouns,
          visibility,
          status,
          pinned_items,
          achievements
        from support_identity_profiles.support_profiles
        where account_id = $1
      `,
      [accountId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapProfile(row);
  }

  async replace(profile: UserProfile): Promise<void> {
    await this.database.query(
      `
        update support_identity_profiles.support_profiles
        set display_name = $2,
            bio = $3,
            location = $4,
            pronouns = $5,
            visibility = $6,
            status = $7::jsonb,
            pinned_items = $8::jsonb,
            achievements = $9::jsonb,
            updated_at = now()
        where account_id = $1
      `,
      [
        profile.accountId,
        profile.displayName,
        profile.bio,
        profile.location,
        profile.pronouns,
        profile.visibility,
        JSON.stringify(profile.status),
        JSON.stringify(profile.pinnedItems),
        JSON.stringify(profile.achievements),
      ],
    );
  }
}
