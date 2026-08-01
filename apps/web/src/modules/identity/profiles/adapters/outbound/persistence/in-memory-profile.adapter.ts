import type { ProfileRepositoryPort } from "../../../application/ports/outbound/profile.repository.port";
import type { UserProfile } from "../../../contracts/user-profile";

type ProfileStore = Map<string, UserProfile>;

const developmentProfiles: readonly UserProfile[] = [
  {
    accountId: "account_mock",
    displayName: "Mock User",
    bio: "Building a calmer collaboration workspace.",
    location: "Taipei",
    pronouns: "",
    visibility: "public",
    status: { emoji: "🛠️", message: "Shipping Support", isBusy: false },
    pinnedItems: ["repository_support", "repository_helix"],
    achievements: [
      {
        slug: "quickdraw",
        title: "Quickdraw",
        description: "Closed an issue shortly after opening it.",
        tier: "base",
        isVisible: true,
      },
      {
        slug: "pair-extraordinaire",
        title: "Pair Extraordinaire",
        description: "Collaborated on a supported project milestone.",
        tier: "bronze",
        isVisible: true,
      },
    ],
  },
  {
    accountId: "account_octocat",
    displayName: "The Octocat",
    bio: "A friendly fixture profile.",
    location: "San Francisco",
    pronouns: "",
    visibility: "public",
    status: null,
    pinnedItems: ["repository_support"],
    achievements: [
      {
        slug: "galaxy-brain",
        title: "Galaxy Brain",
        description: "Shared an answer accepted by the community.",
        tier: "gold",
        isVisible: true,
      },
    ],
  },
  {
    accountId: "account_hubot",
    displayName: "Hubot",
    bio: "Automation account.",
    location: "",
    pronouns: "",
    visibility: "private",
    status: null,
    pinnedItems: [],
    achievements: [],
  },
  {
    accountId: "account_bob",
    displayName: "Bob",
    bio: "",
    location: "",
    pronouns: "",
    visibility: "public",
    status: null,
    pinnedItems: [],
    achievements: [],
  },
];

declare global {
  var __supportProfileStoreV1: Map<string, UserProfile> | undefined;
}

function createStore(): Map<string, UserProfile> {
  return new Map(
    developmentProfiles.map((profile) => [profile.accountId, profile]),
  );
}

function getProcessStore(): Map<string, UserProfile> {
  globalThis.__supportProfileStoreV1 ??= createStore();
  return globalThis.__supportProfileStoreV1;
}

export class InMemoryProfileAdapter implements ProfileRepositoryPort {
  private readonly profiles: ProfileStore;

  constructor(profiles: ProfileStore = getProcessStore()) {
    this.profiles = profiles;
  }

  findByAccountId(accountId: string): Promise<UserProfile | null> {
    return Promise.resolve(this.profiles.get(accountId) ?? null);
  }

  replace(profile: UserProfile): Promise<void> {
    this.profiles.set(profile.accountId, profile);
    return Promise.resolve();
  }
}
