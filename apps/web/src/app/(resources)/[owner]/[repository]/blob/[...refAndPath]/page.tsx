import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryBlobPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/blob/{*refAndPath}",
    title: "Repository file",
    summary:
      "Reserve the GitHub-style repository file route without introducing Git content behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
