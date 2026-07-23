import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryRawPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/raw/{*refAndPath}",
    title: "Raw repository content",
    summary:
      "Reserve the GitHub-style raw content route without introducing Git content behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
