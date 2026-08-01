import { notFound } from "next/navigation";

export default function RepositoryComparisonPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/compare/{*comparison}",
    title: "Repository comparison",
    summary:
      "Reserve GitHub-style revision comparison routes without introducing Git diff behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
