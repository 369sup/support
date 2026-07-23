import { notFound } from "next/navigation";

export default function MilestonesPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/milestones",
    title: "Milestones",
    summary: "List repository milestones and their issue progress.",
    contexts: ["collaboration/labels-and-milestones"],
    catalogStatus: "planned",
  };
  notFound();
}
