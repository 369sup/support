export type ProfileVisibility = "public" | "private";

export type ProfileStatus = Readonly<{
  emoji: string;
  message: string;
  isBusy: boolean;
}>;

export type ProfileAchievement = Readonly<{
  slug: string;
  title: string;
  description: string;
  tier: "base" | "bronze" | "silver" | "gold";
  isVisible: boolean;
}>;

export type UserProfile = Readonly<{
  accountId: string;
  displayName: string;
  bio: string;
  location: string;
  pronouns: string;
  visibility: ProfileVisibility;
  status: ProfileStatus | null;
  pinnedItems: readonly string[];
  achievements: readonly ProfileAchievement[];
}>;
