import { notFound } from "next/navigation";

export default function RepositoryWikiPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/wiki",
    title: "Repository wiki",
    summary:
      "Reserve the GitHub-style wiki entry route while wiki content remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  };
  notFound();
}
