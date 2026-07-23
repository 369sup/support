import { notFound } from "next/navigation";

export default function IssueViewsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/issues/views",
    title: "Issue views",
    summary: "Review saved issue filters and permission-aware issue views.",
    contexts: ["collaboration/issues"],
    catalogStatus: "planned",
  };
  notFound();
}
