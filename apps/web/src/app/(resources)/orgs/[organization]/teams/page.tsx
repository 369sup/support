import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationTeamsPage(): never {
  return unavailableRoute({
    urlPattern: "/orgs/{organization}/teams",
    title: "Organization teams",
    summary: "List organization teams visible to the actor.",
    contexts: ["organizations/organization-teams"],
    catalogStatus: "active",
  });
}
