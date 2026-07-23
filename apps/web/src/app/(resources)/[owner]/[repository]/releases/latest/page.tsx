import { notFound } from "next/navigation";

export default function LatestRepositoryReleasePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/releases/latest",
    title: "Latest repository release",
    summary:
      "Reserve the GitHub-style latest release route while release behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  };
  notFound();
}
