import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryBlamePage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/blame/{*refAndPath}",
    title: "Repository blame",
    summary:
      "Reserve the GitHub-style blame route without introducing Git history behavior.",
    contexts: [],
    catalogStatus: "excluded",
  });
}
