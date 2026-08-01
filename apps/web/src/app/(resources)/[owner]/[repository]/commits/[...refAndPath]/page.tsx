import { notFound } from "next/navigation";

export default function RepositoryCommitsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/commits/{*refAndPath}",
    title: "Repository commit history",
    summary:
      "Reserve the GitHub-style commit history route without introducing Git behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
