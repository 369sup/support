import { notFound } from "next/navigation";

export default function RepositoryInsightsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/pulse",
    title: "Repository insights",
    summary: "Present non-code engagement and integration-health insights without traffic or Git metrics.",
    contexts: ["projections/repository-insights"],
    catalogStatus: "planned",
  };
  notFound();
}
