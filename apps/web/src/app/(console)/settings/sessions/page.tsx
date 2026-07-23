import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function SessionsSettingsPage(): never {
  return unavailableRoute({
    urlPattern: "/settings/sessions",
    title: "Sessions",
    summary: "Review and revoke browser account sessions.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  });
}
