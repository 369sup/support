import type {
  ProfileStatus,
  ProfileVisibility,
  UserProfile,
} from "../../../domain/user-profile";

export type UpdateUserProfileCommand = Readonly<{
  actorAccountId: string;
  accountId: string;
  displayName: string;
  bio: string;
  location: string;
  pronouns: string;
  visibility: ProfileVisibility;
  status: ProfileStatus | null;
}>;

export type UpdateUserProfileResult =
  | Readonly<{ status: "updated"; profile: UserProfile }>
  | Readonly<{ status: "forbidden" }>
  | Readonly<{ status: "invalid-profile" }>
  | Readonly<{ status: "profile-not-found" }>;

export interface UpdateUserProfileUseCase {
  updateUserProfile(
    command: UpdateUserProfileCommand,
  ): Promise<UpdateUserProfileResult>;
}
