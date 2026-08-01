import { notFound } from "next/navigation";

export default function RepositoryComparePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/compare",
    title: "Compare repository revisions",
    summary:
      "Reserve the GitHub-style comparison entry route without introducing Git diff behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
