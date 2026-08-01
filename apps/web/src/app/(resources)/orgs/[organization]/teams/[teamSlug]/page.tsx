import { notFound } from "next/navigation";

export default function OrganizationTeamPage(): never {
  void {
    urlPattern: "/orgs/{organization}/teams/{teamSlug}",
    title: "Organization team",
    summary: "Review one team, its hierarchy, maintainers, and members.",
    contexts: ["organizations/organization-teams"],
    catalogStatus: "active",
  };
  notFound();
}
