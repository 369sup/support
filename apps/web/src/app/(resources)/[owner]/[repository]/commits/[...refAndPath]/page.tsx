import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryCommitsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/commits/{*refAndPath}",
    title: "Repository commit history",
    summary:
      "Reserve the GitHub-style commit history route without introducing Git behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
