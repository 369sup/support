import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function InstallationsSettingsPage(): never {
  return unavailableRoute({
    urlPattern: "/settings/installations",
    title: "Installed GitHub Apps",
    summary: "Review application installations available to the account.",
    contexts: ["integrations/github-app-installations"],
    catalogStatus: "planned",
  });
}
