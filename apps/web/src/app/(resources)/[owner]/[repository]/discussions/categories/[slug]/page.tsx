import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function DiscussionCategoryPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/discussions/categories/{slug}",
    title: "Discussion category",
    summary: "List repository discussions in one category.",
    contexts: ["collaboration/discussions"],
    catalogStatus: "planned",
  });
}
