import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryActivityPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/activity",
    title: "Repository activity",
    summary: "Present a permission-filtered feed of supported non-code repository events.",
    contexts: ["projections/activity-feed"],
    catalogStatus: "planned",
  });
}
