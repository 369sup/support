import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryProjectsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/projects",
    title: "Repository projects",
    summary: "List projects linked to a repository without implying repository ownership.",
    contexts: ["collaboration/projects", "repositories/repository-features"],
    catalogStatus: "planned",
  });
}
