import { notFound } from "next/navigation";

export default function LabelPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/labels/{label}",
    title: "Label",
    summary: "Review one repository label and the collaboration resources classified by it.",
    contexts: ["collaboration/labels-and-milestones"],
    catalogStatus: "planned",
  };
  notFound();
}
