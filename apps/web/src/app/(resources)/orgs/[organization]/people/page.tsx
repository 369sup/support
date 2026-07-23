import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationPeoplePage(): never {
  return unavailableRoute({
    urlPattern: "/orgs/{organization}/people",
    title: "Organization people",
    summary: "List organization memberships visible to the actor.",
    contexts: ["organizations/organization-memberships"],
    catalogStatus: "active",
  });
}
