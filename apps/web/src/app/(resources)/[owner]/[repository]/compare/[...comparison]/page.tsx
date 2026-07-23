import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryComparisonPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/compare/{*comparison}",
    title: "Repository comparison",
    summary:
      "Reserve GitHub-style revision comparison routes without introducing Git diff behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
