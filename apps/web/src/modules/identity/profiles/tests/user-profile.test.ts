import { describe, expect, it } from "vitest";

import { InMemoryProfileAdapter } from "../adapters/outbound/persistence/in-memory-profile.adapter";
import { UpdateUserProfileHandler } from "../application/commands/update-user-profile.handler";
import { GetUserProfileHandler } from "../application/queries/get-user-profile.handler";
import type { UserProfile } from "../contracts/user-profile";

const privateProfile: UserProfile = {
  accountId: "account_test",
  displayName: "Test User",
  bio: "Public bio",
  location: "",
  pronouns: "they/them",
  visibility: "private",
  status: { emoji: "🔒", message: "Private", isBusy: true },
  pinnedItems: ["repository_private"],
  achievements: [
    {
      slug: "visible",
      title: "Visible",
      description: "Visible badge",
      tier: "base",
      isVisible: true,
    },
    {
      slug: "hidden",
      title: "Hidden",
      description: "Hidden badge",
      tier: "gold",
      isVisible: false,
    },
  ],
};

describe("user profile", () => {
  it("filters private social fields for another account", async () => {
    const profiles = new InMemoryProfileAdapter(
      new Map([[privateProfile.accountId, privateProfile]]),
    );
    const query = new GetUserProfileHandler(profiles);

    await expect(
      query.getUserProfile({ accountId: privateProfile.accountId, isOwner: false }),
    ).resolves.toMatchObject({
      status: "found",
      profile: {
        bio: "Public bio",
        status: null,
        pinnedItems: [],
        achievements: [{ slug: "visible" }],
      },
    });
  });

  it("rejects an update from another account", async () => {
    const profiles = new InMemoryProfileAdapter(
      new Map([[privateProfile.accountId, privateProfile]]),
    );
    const command = new UpdateUserProfileHandler(profiles);

    await expect(
      command.updateUserProfile({
        actorAccountId: "account_other",
        accountId: privateProfile.accountId,
        displayName: "Changed",
        bio: "",
        location: "",
        pronouns: "",
        visibility: "public",
        status: null,
      }),
    ).resolves.toEqual({ status: "forbidden" });
  });
});
