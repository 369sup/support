import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryBranchViewPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/branches/{view}",
    title: "Repository branch view",
    summary:
      "Reserve GitHub-style branch view routes without introducing Git ref behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
