import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}",
    title: "Repository",
    summary: "Open the non-code repository overview and its enabled collaboration capabilities.",
    contexts: [
      "repositories/repositories",
      "repositories/repository-access",
      "repositories/repository-features",
      "repositories/repository-metadata",
    ],
    catalogStatus: "mixed",
  });
}
