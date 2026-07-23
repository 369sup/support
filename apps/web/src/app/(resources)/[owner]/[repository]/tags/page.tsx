import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryTagsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/tags",
    title: "Repository tags",
    summary:
      "Reserve the GitHub-style tag listing route without introducing Git ref behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
