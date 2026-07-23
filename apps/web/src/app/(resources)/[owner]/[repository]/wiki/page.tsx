import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryWikiPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/wiki",
    title: "Repository wiki",
    summary:
      "Reserve the GitHub-style wiki entry route while wiki content remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  });
}
