import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryCommunityPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/community",
    title: "Repository community profile",
    summary:
      "Reserve the GitHub-style community route while community profile behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  });
}
