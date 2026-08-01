import { notFound } from "next/navigation";

export default function RepositoryBranchesPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/branches",
    title: "Repository branches",
    summary:
      "Reserve the GitHub-style branch listing route without introducing Git ref behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
