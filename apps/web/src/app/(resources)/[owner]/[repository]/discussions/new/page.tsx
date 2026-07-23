import { notFound } from "next/navigation";

export default function NewDiscussionPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/discussions/new",
    title: "New discussion",
    summary: "Create a discussion in an enabled repository category.",
    contexts: ["collaboration/discussions"],
    catalogStatus: "planned",
  };
  notFound();
}
