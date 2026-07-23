import { notFound } from "next/navigation";

export default function MilestonePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/milestone/{number}",
    title: "Milestone",
    summary: "Review one repository milestone and its linked issues.",
    contexts: ["collaboration/labels-and-milestones", "collaboration/issues"],
    catalogStatus: "planned",
  };
  notFound();
}
