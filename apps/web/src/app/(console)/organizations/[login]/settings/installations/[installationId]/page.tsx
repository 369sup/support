import { notFound } from "next/navigation";

export default function OrganizationInstallationPage(): never {
  void {
    urlPattern:
      "/organizations/{organization}/settings/installations/{installationId}",
    title: "Organization installation",
    summary: "Review one GitHub App installation and its organization resource access.",
    contexts: ["integrations/github-app-installations"],
    catalogStatus: "planned",
  };
  notFound();
}
