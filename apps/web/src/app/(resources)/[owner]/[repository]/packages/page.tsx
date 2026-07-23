import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryPackagesPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/packages",
    title: "Repository packages",
    summary:
      "Reserve the GitHub-style packages route without introducing code package behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
