import { notFound } from "next/navigation";

export default function RepositoryPagesPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/pages",
    title: "Repository Pages",
    summary:
      "Reserve the requested GitHub-style Pages route without introducing source publishing behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
