import { notFound } from "next/navigation";

export default function RepositoryReleasesPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/releases",
    title: "Repository releases",
    summary:
      "Reserve the GitHub-style release listing route while release behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  };
  notFound();
}
