import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function SettingsPage(): never {
  return unavailableRoute({
    urlPattern: "/settings",
    title: "Settings",
    summary: "Open the account-level settings entry point for identity, integrations, and billing.",
    contexts: [
      "identity/authentication",
      "integrations/oauth-authorizations",
      "commerce/billing",
    ],
    catalogStatus: "mixed",
  });
}
