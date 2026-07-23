import { notFound } from "next/navigation";

export default function WatchersPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/watchers",
    title: "Watchers",
    summary: "List visible repository subscription relationships.",
    contexts: ["engagement/subscriptions"],
    catalogStatus: "planned",
  };
  notFound();
}
