import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function SearchPage(): never {
  return unavailableRoute({
    urlPattern: "/search",
    title: "Search",
    summary: "Search permission-filtered product resources through the search projection.",
    contexts: ["projections/search", "platform/search-index"],
    catalogStatus: "mixed",
  });
}
