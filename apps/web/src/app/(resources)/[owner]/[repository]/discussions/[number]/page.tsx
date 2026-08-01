import { notFound } from "next/navigation";

export default function DiscussionPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/discussions/{number}",
    title: "Discussion",
    summary: "Review one discussion, its conversation, answer state, and moderation status.",
    contexts: [
      "collaboration/discussions",
      "collaboration/conversations",
      "collaboration/moderation",
    ],
    catalogStatus: "planned",
  };
  notFound();
}
