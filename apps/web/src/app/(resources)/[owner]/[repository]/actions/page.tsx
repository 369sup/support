import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryActionsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/actions",
    title: "Repository Actions",
    summary:
      "Reserve the GitHub-style Actions entry route without introducing workflow behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
