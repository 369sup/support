import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function ExplorePage(): never {
  return unavailableRoute({
    urlPattern: "/explore",
    title: "Explore",
    summary: "Reserve the GitHub-style public discovery entry point without assigning product ownership.",
    contexts: [],
    catalogStatus: "unowned",
  });
}
