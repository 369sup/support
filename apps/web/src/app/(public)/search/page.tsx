import { notFound } from "next/navigation";

export default function SearchPage(): never {
  void {
    urlPattern: "/search",
    title: "Search",
    summary: "Search permission-filtered product resources through the search projection.",
    contexts: ["projections/search", "platform/search-index"],
    catalogStatus: "mixed",
  };
  notFound();
}
