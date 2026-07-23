import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryComparePage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/compare",
    title: "Compare repository revisions",
    summary:
      "Reserve the GitHub-style comparison entry route without introducing Git diff behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
