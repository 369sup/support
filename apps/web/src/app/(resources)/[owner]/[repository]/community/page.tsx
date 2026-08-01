import { notFound } from "next/navigation";

export default function RepositoryCommunityPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/community",
    title: "Repository community profile",
    summary:
      "Reserve the GitHub-style community route while community profile behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  };
  notFound();
}
