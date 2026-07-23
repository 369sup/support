import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function ApplicationsSettingsPage(): never {
  return unavailableRoute({
    urlPattern: "/settings/applications",
    title: "Applications",
    summary: "Review OAuth applications and account authorizations.",
    contexts: [
      "integrations/oauth-app-registrations",
      "integrations/oauth-authorizations",
    ],
    catalogStatus: "planned",
  });
}
