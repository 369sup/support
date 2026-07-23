import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function AppsSettingsPage(): never {
  return unavailableRoute({
    urlPattern: "/settings/apps",
    title: "GitHub Apps",
    summary: "Manage account-owned application registrations.",
    contexts: ["integrations/github-app-registrations"],
    catalogStatus: "planned",
  });
}
