import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryBranchesPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/branches",
    title: "Repository branches",
    summary:
      "Reserve the GitHub-style branch listing route without introducing Git ref behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
