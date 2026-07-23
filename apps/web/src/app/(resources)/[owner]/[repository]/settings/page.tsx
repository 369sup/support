import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositorySettingsPage(): never {
  return unavailableRoute({
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
  });
}
