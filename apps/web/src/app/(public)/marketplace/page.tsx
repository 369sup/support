import { notFound } from "next/navigation";

export default function MarketplacePage(): never {
  void {
    urlPattern: "/marketplace",
    title: "Marketplace",
    summary: "Reserve the public marketplace entry point without defining listing or commerce behavior.",
    contexts: [],
    catalogStatus: "unowned",
  };
  notFound();
}
