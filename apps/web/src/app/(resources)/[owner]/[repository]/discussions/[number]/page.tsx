import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function DiscussionPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/discussions/{number}",
    title: "Discussion",
    summary: "Review one discussion, its conversation, answer state, and moderation status.",
    contexts: [
      "collaboration/discussions",
      "collaboration/conversations",
      "collaboration/moderation",
    ],
    catalogStatus: "planned",
  });
}
