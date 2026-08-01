import { notFound } from "next/navigation";

export default function RepositoryActionsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/actions",
    title: "Repository Actions",
    summary:
      "Reserve the GitHub-style Actions entry route without introducing workflow behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
