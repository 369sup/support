import { notFound } from "next/navigation";

export default function IssuePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/issues/{number}",
    title: "Issue",
    summary: "Review one issue, its lifecycle, conversation, labels, and milestone.",
    contexts: [
      "collaboration/issues",
      "collaboration/conversations",
      "collaboration/labels-and-milestones",
      "collaboration/moderation",
    ],
    catalogStatus: "planned",
  };
  notFound();
}
