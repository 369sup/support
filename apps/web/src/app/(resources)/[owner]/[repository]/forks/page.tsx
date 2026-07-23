import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryForksPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/forks",
    title: "Repository forks",
    summary:
      "Reserve the GitHub-style forks route while fork behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  });
}
