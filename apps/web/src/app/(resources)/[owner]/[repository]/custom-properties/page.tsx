import { notFound } from "next/navigation";

export default function RepositoryCustomPropertiesPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/custom-properties",
    title: "Repository custom properties",
    summary: "Review organization-defined custom property values for a repository.",
    contexts: ["organizations/custom-properties"],
    catalogStatus: "planned",
  };
  notFound();
}
