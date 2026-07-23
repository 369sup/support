import { notFound } from "next/navigation";

export default function RepositoryPullRequestPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/pull/{*pullPath}",
    title: "Pull request",
    summary:
      "Reserve GitHub-style pull request routes without introducing code review behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
