import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function MarketplacePage(): never {
  return unavailableRoute({
    urlPattern: "/marketplace",
    title: "Marketplace",
    summary: "Reserve the public marketplace entry point without defining listing or commerce behavior.",
    contexts: [],
    catalogStatus: "unowned",
  });
}
