import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function IssueViewsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/issues/views",
    title: "Issue views",
    summary: "Review saved issue filters and permission-aware issue views.",
    contexts: ["collaboration/issues"],
    catalogStatus: "planned",
  });
}
