import { notFound } from "next/navigation";

export default function RepositoryRawPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/raw/{*refAndPath}",
    title: "Raw repository content",
    summary:
      "Reserve the GitHub-style raw content route without introducing Git content behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
