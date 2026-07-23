import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryAccessSettingsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/settings/access",
    title: "Repository access",
    summary: "Review effective repository permissions and their direct, team, or role sources.",
    contexts: ["repositories/repository-access"],
    catalogStatus: "active",
  });
}
