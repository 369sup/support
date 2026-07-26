import { InMemoryProfileAdapter } from "../adapters/outbound/persistence/in-memory-profile.adapter";
import { UpdateUserProfileHandler } from "../application/commands/update-user-profile.handler";
import type { GetUserProfileUseCase } from "../application/ports/inbound/get-user-profile.use-case";
import type { UpdateUserProfileUseCase } from "../application/ports/inbound/update-user-profile.use-case";
import { GetUserProfileHandler } from "../application/queries/get-user-profile.handler";

export type ProfilesServerFacade = Readonly<{
  getUserProfile: GetUserProfileUseCase["getUserProfile"];
  updateUserProfile: UpdateUserProfileUseCase["updateUserProfile"];
}>;

function composeProfilesServerFacade(): ProfilesServerFacade {
  const profiles = new InMemoryProfileAdapter();
  const getUserProfile = new GetUserProfileHandler(profiles);
  const updateUserProfile = new UpdateUserProfileHandler(profiles);

  return {
    getUserProfile: getUserProfile.getUserProfile.bind(getUserProfile),
    updateUserProfile: updateUserProfile.updateUserProfile.bind(updateUserProfile),
  };
}

export const profilesServerFacade = composeProfilesServerFacade();
