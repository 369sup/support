import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryPullRequestPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/pull/{*pullPath}",
    title: "Pull request",
    summary:
      "Reserve GitHub-style pull request routes without introducing code review behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
