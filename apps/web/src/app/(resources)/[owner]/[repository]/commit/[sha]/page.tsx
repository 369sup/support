import { notFound } from "next/navigation";

export default function RepositoryCommitPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/commit/{sha}",
    title: "Repository commit",
    summary:
      "Reserve the GitHub-style commit route without introducing Git object behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
