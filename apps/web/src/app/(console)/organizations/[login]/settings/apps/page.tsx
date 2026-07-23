import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationAppsPage(): never {
  return unavailableRoute({
    urlPattern: "/organizations/{organization}/settings/apps",
    title: "Organization GitHub Apps",
    summary: "Manage application registrations owned by an organization.",
    contexts: ["integrations/github-app-registrations"],
    catalogStatus: "planned",
  });
}
