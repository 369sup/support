import { notFound } from "next/navigation";

export default function RepositoryBlamePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/blame/{*refAndPath}",
    title: "Repository blame",
    summary:
      "Reserve the GitHub-style blame route without introducing Git history behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
