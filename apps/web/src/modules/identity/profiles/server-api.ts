import { profilesServerFacade } from "./composition/profiles.composition";

export type {
  ProfileAchievement,
  ProfileStatus,
  ProfileVisibility,
  UserProfile,
} from "./contracts/user-profile";

export const getUserProfile = profilesServerFacade.getUserProfile;
export const updateUserProfile = profilesServerFacade.updateUserProfile;
