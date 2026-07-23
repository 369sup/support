import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryTrafficPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/graphs/traffic",
    title: "Repository traffic",
    summary:
      "Reserve the GitHub-style traffic route while repository traffic metrics remain deferred.",
    contexts: [],
    catalogStatus: "deferred",
  });
}
