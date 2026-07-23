import { notFound } from "next/navigation";

export default function RepositoryAccessSettingsPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/settings/access",
    title: "Repository access",
    summary: "Review effective repository permissions and their direct, team, or role sources.",
    contexts: ["repositories/repository-access"],
    catalogStatus: "active",
  };
  notFound();
}
