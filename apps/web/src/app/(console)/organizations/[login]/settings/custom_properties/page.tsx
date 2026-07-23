import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationCustomPropertiesPage(): never {
  return unavailableRoute({
    urlPattern: "/organizations/{organization}/settings/custom_properties",
    title: "Organization custom properties",
    summary: "Define organization-owned custom property schemas and values.",
    contexts: ["organizations/custom-properties"],
    catalogStatus: "planned",
  });
}
