import { notFound } from "next/navigation";

export default function RepositoryArchivePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/archive/{*archivePath}",
    title: "Repository archive",
    summary:
      "Reserve GitHub-style archive routes without introducing Git content downloads.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
