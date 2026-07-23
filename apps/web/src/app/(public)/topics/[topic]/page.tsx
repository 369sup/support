import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function TopicPage(): never {
  return unavailableRoute({
    urlPattern: "/topics/{topic}",
    title: "Topic",
    summary: "Reserve a public topic detail URL without defining topic discovery behavior.",
    contexts: [],
    catalogStatus: "unowned",
  });
}
