import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryWikiPageNamePage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/wiki/{*pageName}",
    title: "Repository wiki page",
    summary:
      "Reserve GitHub-style wiki page routes while wiki content remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  });
}
