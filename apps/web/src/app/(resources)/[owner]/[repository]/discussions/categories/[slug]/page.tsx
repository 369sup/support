import { notFound } from "next/navigation";

export default function DiscussionCategoryPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/discussions/categories/{slug}",
    title: "Discussion category",
    summary: "List repository discussions in one category.",
    contexts: ["collaboration/discussions"],
    catalogStatus: "planned",
  };
  notFound();
}
