import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function StargazersPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/stargazers",
    title: "Stargazers",
    summary: "List accounts that starred a repository when visibility permits.",
    contexts: ["engagement/stars"],
    catalogStatus: "planned",
  });
}
