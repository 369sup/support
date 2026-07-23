import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryPullRequestsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/pulls",
    title: "Pull requests",
    summary:
      "Reserve the GitHub-style pull request listing route without introducing code review behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
