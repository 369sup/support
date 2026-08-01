import type { UserProfile } from "../../../domain/user-profile";

export type GetUserProfileQuery = Readonly<{
  accountId: string;
  isOwner: boolean;
}>;

export type GetUserProfileResult =
  | Readonly<{ status: "found"; profile: UserProfile }>
  | Readonly<{ status: "invalid-account-id" }>
  | Readonly<{ status: "profile-not-found" }>;

export interface GetUserProfileUseCase {
  getUserProfile(query: GetUserProfileQuery): Promise<GetUserProfileResult>;
}
