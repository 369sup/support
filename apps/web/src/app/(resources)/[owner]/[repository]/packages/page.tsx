import { notFound } from "next/navigation";

export default function RepositoryPackagesPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/packages",
    title: "Repository packages",
    summary:
      "Reserve the GitHub-style packages route without introducing code package behavior.",
    contexts: [],
    catalogStatus: "excluded",
  };
  notFound();
}
