import { notFound } from "next/navigation";

export default function TopicPage(): never {
  void {
    urlPattern: "/topics/{topic}",
    title: "Topic",
    summary: "Reserve a public topic detail URL without defining topic discovery behavior.",
    contexts: [],
    catalogStatus: "unowned",
  };
  notFound();
}
