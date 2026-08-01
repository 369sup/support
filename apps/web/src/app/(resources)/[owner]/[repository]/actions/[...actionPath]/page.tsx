import { notFound } from "next/navigation";

export default function RepositoryActionPathPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/actions/{*actionPath}",
    title: "Repository Actions view",
    summary:
      "Reserve GitHub-style Actions subroutes without introducing workflow behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
