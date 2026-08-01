import { notFound } from "next/navigation";

export default function LabelsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/labels",
    title: "Labels",
    summary: "Manage repository labels used by collaboration resources.",
    contexts: ["collaboration/labels-and-milestones"],
    catalogStatus: "planned",
  };
  notFound();
}
