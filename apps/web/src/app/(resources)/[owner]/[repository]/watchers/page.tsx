import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function WatchersPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/watchers",
    title: "Watchers",
    summary: "List visible repository subscription relationships.",
    contexts: ["engagement/subscriptions"],
    catalogStatus: "planned",
  });
}
