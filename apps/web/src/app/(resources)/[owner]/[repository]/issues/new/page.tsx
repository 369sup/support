import { notFound } from "next/navigation";

export default function NewIssuePage(): never {
  void {
    urlPattern: "/{owner}/{repository}/issues/new",
    title: "New issue",
    summary: "Create an issue using the repository's enabled issue schema.",
    contexts: ["collaboration/issues", "collaboration/issue-schema"],
    catalogStatus: "planned",
  };
  notFound();
}
