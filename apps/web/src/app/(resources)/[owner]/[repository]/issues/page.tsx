import { notFound } from "next/navigation";

export default function IssuesPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/issues",
    title: "Issues",
    summary: "List and filter repository issues visible to the actor.",
    contexts: [
      "collaboration/issues",
      "collaboration/issue-schema",
      "collaboration/labels-and-milestones",
    ],
    catalogStatus: "planned",
  };
  notFound();
}
