import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryArchivePage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/archive/{*archivePath}",
    title: "Repository archive",
    summary:
      "Reserve GitHub-style archive routes without introducing Git content downloads.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
