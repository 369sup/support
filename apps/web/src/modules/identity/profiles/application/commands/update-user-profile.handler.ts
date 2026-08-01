import type { UserProfile } from "../../domain/user-profile";
import type {
  UpdateUserProfileCommand,
  UpdateUserProfileResult,
  UpdateUserProfileUseCase,
} from "../ports/inbound/update-user-profile.use-case";
import type { ProfileRepositoryPort } from "../ports/outbound/profile.repository.port";

const MAXIMUM_BIO_LENGTH = 160;

function normalizeProfile(
  current: UserProfile,
  command: UpdateUserProfileCommand,
): UserProfile | null {
  const displayName = command.displayName.trim();
  const bio = command.bio.trim();

  if (displayName.length === 0 || bio.length > MAXIMUM_BIO_LENGTH) {
    return null;
  }

  return {
    ...current,
    displayName,
    bio,
    location: command.location.trim(),
    pronouns: command.pronouns.trim(),
    visibility: command.visibility,
    status:
      command.status === null
        ? null
        : {
            emoji: command.status.emoji.trim(),
            message: command.status.message.trim(),
            isBusy: command.status.isBusy,
          },
  };
}

export class UpdateUserProfileHandler implements UpdateUserProfileUseCase {
  private readonly profiles: ProfileRepositoryPort;

  constructor(profiles: ProfileRepositoryPort) {
    this.profiles = profiles;
  }

  async updateUserProfile(
    command: UpdateUserProfileCommand,
  ): Promise<UpdateUserProfileResult> {
    if (command.actorAccountId !== command.accountId) {
      return { status: "forbidden" };
    }

    const current = await this.profiles.findByAccountId(command.accountId);
    if (current === null) {
      return { status: "profile-not-found" };
    }

    const profile = normalizeProfile(current, command);
    if (profile === null) {
      return { status: "invalid-profile" };
    }

    await this.profiles.replace(profile);
    return { status: "updated", profile };
  }
}
