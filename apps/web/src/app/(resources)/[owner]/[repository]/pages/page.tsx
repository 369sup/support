import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryPagesPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/pages",
    title: "Repository Pages",
    summary:
      "Reserve the requested GitHub-style Pages route without introducing source publishing behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
