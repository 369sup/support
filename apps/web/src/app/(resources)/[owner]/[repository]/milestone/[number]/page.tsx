import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function MilestonePage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/milestone/{number}",
    title: "Milestone",
    summary: "Review one repository milestone and its linked issues.",
    contexts: ["collaboration/labels-and-milestones", "collaboration/issues"],
    catalogStatus: "planned",
  });
}
