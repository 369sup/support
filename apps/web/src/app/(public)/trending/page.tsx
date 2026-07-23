import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function TrendingPage(): never {
  return unavailableRoute({
    urlPattern: "/trending",
    title: "Trending",
    summary: "Reserve the public trending entry point without defining ranking or telemetry semantics.",
    contexts: [],
    catalogStatus: "unowned",
  });
}
