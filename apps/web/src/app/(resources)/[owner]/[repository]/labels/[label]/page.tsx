import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function LabelPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/labels/{label}",
    title: "Label",
    summary: "Review one repository label and the collaboration resources classified by it.",
    contexts: ["collaboration/labels-and-milestones"],
    catalogStatus: "planned",
  });
}
