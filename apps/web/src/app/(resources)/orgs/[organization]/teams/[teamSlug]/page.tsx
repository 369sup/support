import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationTeamPage(): never {
  return unavailableRoute({
    urlPattern: "/orgs/{organization}/teams/{teamSlug}",
    title: "Organization team",
    summary: "Review one team, its hierarchy, maintainers, and members.",
    contexts: ["organizations/organization-teams"],
    catalogStatus: "active",
  });
}
