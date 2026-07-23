import { notFound } from "next/navigation";

export default function TopicsPage(): never {
  void {
    urlPattern: "/topics",
    title: "Topics",
    summary: "Reserve the public topic discovery index without activating a discovery context.",
    contexts: [],
    catalogStatus: "unowned",
  };
  notFound();
}
