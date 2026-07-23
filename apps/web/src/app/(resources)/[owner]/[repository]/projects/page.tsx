import { notFound } from "next/navigation";

export default function RepositoryProjectsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/projects",
    title: "Repository projects",
    summary: "List projects linked to a repository without implying repository ownership.",
    contexts: ["collaboration/projects", "repositories/repository-features"],
    catalogStatus: "planned",
  };
  notFound();
}
