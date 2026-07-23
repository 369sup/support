import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryInsightsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/pulse",
    title: "Repository insights",
    summary: "Present non-code engagement and integration-health insights without traffic or Git metrics.",
    contexts: ["projections/repository-insights"],
    catalogStatus: "planned",
  });
}
