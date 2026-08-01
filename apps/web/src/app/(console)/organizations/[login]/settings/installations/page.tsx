import { notFound } from "next/navigation";

export default function OrganizationInstallationsPage(): never {
  void {
    urlPattern: "/organizations/{organization}/settings/installations",
    title: "Organization installations",
    summary: "List GitHub App installations for an organization.",
    contexts: ["integrations/github-app-installations"],
    catalogStatus: "planned",
  };
  notFound();
}
