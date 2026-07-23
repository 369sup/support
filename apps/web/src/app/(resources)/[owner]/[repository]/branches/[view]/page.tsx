import { notFound } from "next/navigation";

export default function RepositoryBranchViewPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/branches/{view}",
    title: "Repository branch view",
    summary:
      "Reserve GitHub-style branch view routes without introducing Git ref behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
