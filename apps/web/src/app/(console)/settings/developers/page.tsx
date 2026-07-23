import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function DeveloperSettingsPage(): never {
  return unavailableRoute({
    urlPattern: "/settings/developers",
    title: "Developer settings",
    summary: "Open the account-level integration registration settings entry point.",
    contexts: [
      "integrations/github-app-registrations",
      "integrations/oauth-app-registrations",
    ],
    catalogStatus: "planned",
  });
}
