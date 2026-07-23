import { notFound } from "next/navigation";

export default function DiscussionsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/discussions",
    title: "Discussions",
    summary: "List repository discussions grouped by supported categories.",
    contexts: [
      "collaboration/discussions",
      "collaboration/conversations",
      "collaboration/moderation",
    ],
    catalogStatus: "planned",
  };
  notFound();
}
