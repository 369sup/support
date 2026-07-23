import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function LatestRepositoryReleasePage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/releases/latest",
    title: "Latest repository release",
    summary:
      "Reserve the GitHub-style latest release route while release behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  });
}
