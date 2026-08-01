import { notFound } from "next/navigation";

export default function TaggedRepositoryReleasePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/releases/tag/{*tag}",
    title: "Tagged repository release",
    summary:
      "Reserve GitHub-style tagged release routes while release behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  };
  notFound();
}
