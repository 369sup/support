import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function DiscussionsPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/discussions",
    title: "Discussions",
    summary: "List repository discussions grouped by supported categories.",
    contexts: [
      "collaboration/discussions",
      "collaboration/conversations",
      "collaboration/moderation",
    ],
    catalogStatus: "planned",
  });
}
