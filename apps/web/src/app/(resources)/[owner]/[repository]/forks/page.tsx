import { notFound } from "next/navigation";

export default function RepositoryForksPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/forks",
    title: "Repository forks",
    summary:
      "Reserve the GitHub-style forks route while fork behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  };
  notFound();
}
