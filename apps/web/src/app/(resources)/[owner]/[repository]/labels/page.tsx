import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function LabelsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/labels",
    title: "Labels",
    summary: "Manage repository labels used by collaboration resources.",
    contexts: ["collaboration/labels-and-milestones"],
    catalogStatus: "planned",
  });
}
