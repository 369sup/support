import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationInstallationsPage(): never {
  return unavailableRoute({
    urlPattern: "/organizations/{organization}/settings/installations",
    title: "Organization installations",
    summary: "List GitHub App installations for an organization.",
    contexts: ["integrations/github-app-installations"],
    catalogStatus: "planned",
  });
}
