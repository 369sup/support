import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryCommitPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/commit/{sha}",
    title: "Repository commit",
    summary:
      "Reserve the GitHub-style commit route without introducing Git object behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
