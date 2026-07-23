import { notFound } from "next/navigation";

export default function RepositorySettingsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/settings",
    title: "Repository settings",
    summary: "Open the repository settings entry point for lifecycle, features, metadata, and autolinks.",
    contexts: [
      "repositories/repositories",
      "repositories/repository-features",
      "repositories/repository-metadata",
      "integrations/repository-autolinks",
    ],
    catalogStatus: "mixed",
  };
  notFound();
}
