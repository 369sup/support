import { notFound } from "next/navigation";

export default function RepositoryActivityPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/activity",
    title: "Repository activity",
    summary: "Present a permission-filtered feed of supported non-code repository events.",
    contexts: ["projections/activity-feed"],
    catalogStatus: "planned",
  };
  notFound();
}
