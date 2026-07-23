import { notFound } from "next/navigation";

export default function RepositoryPage(): never {
  void {
    urlPattern: "/{owner}/{repository}",
    title: "Repository",
    summary: "Open the non-code repository overview and its enabled collaboration capabilities.",
    contexts: [
      "repositories/repositories",
      "repositories/repository-access",
      "repositories/repository-features",
      "repositories/repository-metadata",
    ],
    catalogStatus: "mixed",
  };
  notFound();
}
