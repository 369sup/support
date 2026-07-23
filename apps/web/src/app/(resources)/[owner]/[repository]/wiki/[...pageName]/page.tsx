import { notFound } from "next/navigation";

export default function RepositoryWikiPageNamePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/wiki/{*pageName}",
    title: "Repository wiki page",
    summary:
      "Reserve GitHub-style wiki page routes while wiki content remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  };
  notFound();
}
