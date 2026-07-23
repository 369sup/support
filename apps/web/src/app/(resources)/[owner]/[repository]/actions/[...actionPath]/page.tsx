import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryActionPathPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/actions/{*actionPath}",
    title: "Repository Actions view",
    summary:
      "Reserve GitHub-style Actions subroutes without introducing workflow behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
