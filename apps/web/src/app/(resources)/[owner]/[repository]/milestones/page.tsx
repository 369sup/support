import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function MilestonesPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/milestones",
    title: "Milestones",
    summary: "List repository milestones and their issue progress.",
    contexts: ["collaboration/labels-and-milestones"],
    catalogStatus: "planned",
  });
}
