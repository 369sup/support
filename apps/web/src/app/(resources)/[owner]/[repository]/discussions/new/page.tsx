import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function NewDiscussionPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/discussions/new",
    title: "New discussion",
    summary: "Create a discussion in an enabled repository category.",
    contexts: ["collaboration/discussions"],
    catalogStatus: "planned",
  });
}
