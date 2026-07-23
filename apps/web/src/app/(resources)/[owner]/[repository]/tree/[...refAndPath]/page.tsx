import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryTreePage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/tree/{*refAndPath}",
    title: "Repository tree",
    summary:
      "Reserve the GitHub-style repository tree route without introducing Git content behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
