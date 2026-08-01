import type { ExploreFeedRepositoryPort } from "../../../application/ports/outbound/explore-feed.repository.port";
import type { ExploreFeed } from "../../../contracts/explore-feed";

const fixture: ExploreFeed = {
  collections: [
    {
      description:
        "Issue, notification, discussion, and project patterns without code-hosting behavior.",
      title: "Collaboration foundations",
    },
  ],
  repositories: [
    {
      description:
        "A GitHub-inspired, code-free collaboration product reference implementation.",
      href: "/octocat/support",
      label: "octocat/support",
      topics: ["collaboration", "product-architecture", "nextjs"],
    },
  ],
  topics: ["collaboration", "notifications", "moderation", "projects"],
};

export class InMemoryExploreFeedAdapter
  implements ExploreFeedRepositoryPort
{
  get() {
    return Promise.resolve(fixture);
  }
}
