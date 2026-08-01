import { notFound } from "next/navigation";

export default function RepositoryTagsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/tags",
    title: "Repository tags",
    summary:
      "Reserve the GitHub-style tag listing route without introducing Git ref behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
