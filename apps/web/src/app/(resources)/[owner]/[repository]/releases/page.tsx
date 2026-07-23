import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryReleasesPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/releases",
    title: "Repository releases",
    summary:
      "Reserve the GitHub-style release listing route while release behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  });
}
