import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function TopicsPage(): never {
  return unavailableRoute({
    urlPattern: "/topics",
    title: "Topics",
    summary: "Reserve the public topic discovery index without activating a discovery context.",
    contexts: [],
    catalogStatus: "unowned",
  });
}
