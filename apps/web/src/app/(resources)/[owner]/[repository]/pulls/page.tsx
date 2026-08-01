import { notFound } from "next/navigation";

export default function RepositoryPullRequestsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/pulls",
    title: "Pull requests",
    summary:
      "Reserve the GitHub-style pull request listing route without introducing code review behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
