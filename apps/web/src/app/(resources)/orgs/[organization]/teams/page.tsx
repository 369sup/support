import { notFound } from "next/navigation";

export default function OrganizationTeamsPage(): never {
  void {
    urlPattern: "/orgs/{organization}/teams",
    title: "Organization teams",
    summary: "List organization teams visible to the actor.",
    contexts: ["organizations/organization-teams"],
    catalogStatus: "active",
  };
  notFound();
}
