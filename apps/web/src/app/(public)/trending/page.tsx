import { notFound } from "next/navigation";

export default function TrendingPage(): never {
  void {
    urlPattern: "/trending",
    title: "Trending",
    summary: "Reserve the public trending entry point without defining ranking or telemetry semantics.",
    contexts: [],
    catalogStatus: "unowned",
  };
  notFound();
}
