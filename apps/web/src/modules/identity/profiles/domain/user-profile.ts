export type ProfileVisibility = "public" | "private";
export type ProfileStatus = Readonly<{
  emoji: string;
  isBusy: boolean;
  message: string;
}>;
export type ProfileAchievement = Readonly<{
  description: string;
  isVisible: boolean;
  slug: string;
  tier: "base" | "bronze" | "silver" | "gold";
  title: string;
}>;
export type UserProfile = Readonly<{
  accountId: string;
  achievements: readonly ProfileAchievement[];
  bio: string;
  displayName: string;
  location: string;
  pinnedItems: readonly string[];
  pronouns: string;
  status: ProfileStatus | null;
  visibility: ProfileVisibility;
}>;
