import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function CollectionsPage(): never {
  return unavailableRoute({
    urlPattern: "/collections",
    title: "Collections",
    summary: "Reserve the public curated collections entry point without assigning catalog ownership.",
    contexts: [],
    catalogStatus: "unowned",
  });
}
