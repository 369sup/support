import { notFound } from "next/navigation";

export default function RepositoryTrafficPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/graphs/traffic",
    title: "Repository traffic",
    summary:
      "Reserve the GitHub-style traffic route while repository traffic metrics remain deferred.",
    contexts: [],
    catalogStatus: "deferred",
  };
  notFound();
}
