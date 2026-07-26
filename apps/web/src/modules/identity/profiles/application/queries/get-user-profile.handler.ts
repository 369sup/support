import type {
  GetUserProfileQuery,
  GetUserProfileResult,
  GetUserProfileUseCase,
} from "../ports/inbound/get-user-profile.use-case";
import type { ProfileRepositoryPort } from "../ports/outbound/profile.repository.port";

export class GetUserProfileHandler implements GetUserProfileUseCase {
  private readonly profiles: ProfileRepositoryPort;

  constructor(profiles: ProfileRepositoryPort) {
    this.profiles = profiles;
  }

  async getUserProfile(
    query: GetUserProfileQuery,
  ): Promise<GetUserProfileResult> {
    const accountId = query.accountId.trim();
    if (accountId.length === 0) {
      return { status: "invalid-account-id" };
    }

    const profile = await this.profiles.findByAccountId(accountId);
    if (profile === null) {
      return { status: "profile-not-found" };
    }

    const visibleAchievements = query.isOwner
      ? profile.achievements
      : profile.achievements.filter((achievement) => achievement.isVisible);

    if (profile.visibility === "private" && !query.isOwner) {
      return {
        status: "found",
        profile: {
          ...profile,
          status: null,
          pinnedItems: [],
          achievements: visibleAchievements,
        },
      };
    }

    return {
      status: "found",
      profile: { ...profile, achievements: visibleAchievements },
    };
  }
}
