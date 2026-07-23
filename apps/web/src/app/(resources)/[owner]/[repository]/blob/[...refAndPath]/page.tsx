import { notFound } from "next/navigation";

export default function RepositoryBlobPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/blob/{*refAndPath}",
    title: "Repository file",
    summary:
      "Reserve the GitHub-style repository file route without introducing Git content behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
