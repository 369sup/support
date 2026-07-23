import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationRepositoriesPage(): never {
  return unavailableRoute({
    urlPattern: "/orgs/{organization}/repositories",
    title: "Organization repositories",
    summary: "List repositories owned by an organization and visible to the actor.",
    contexts: ["organizations/organizations", "repositories/repositories"],
    catalogStatus: "active",
  });
}
