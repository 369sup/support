import { notFound } from "next/navigation";

export default function RepositoryTreePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/tree/{*refAndPath}",
    title: "Repository tree",
    summary:
      "Reserve the GitHub-style repository tree route without introducing Git content behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
