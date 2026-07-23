import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function EnterpriseOrganizationsPage(): never {
  return unavailableRoute({
    urlPattern: "/enterprises/{slug}/organizations",
    title: "Enterprise organizations",
    summary: "List organizations owned by an enterprise and visible to the actor.",
    contexts: ["enterprises/enterprises", "organizations/organizations"],
    catalogStatus: "active",
  });
}
