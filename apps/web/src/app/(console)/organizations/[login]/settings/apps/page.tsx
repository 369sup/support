import { notFound } from "next/navigation";

export default function OrganizationAppsPage(): never {
  void {
    urlPattern: "/organizations/{organization}/settings/apps",
    title: "Organization GitHub Apps",
    summary: "Manage application registrations owned by an organization.",
    contexts: ["integrations/github-app-registrations"],
    catalogStatus: "planned",
  };
  notFound();
}
