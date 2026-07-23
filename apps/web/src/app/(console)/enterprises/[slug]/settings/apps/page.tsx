import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function EnterpriseAppsPage(): never {
  return unavailableRoute({
    urlPattern: "/enterprises/{slug}/settings/apps",
    title: "Enterprise GitHub Apps",
    summary: "Manage application registrations owned by an enterprise.",
    contexts: ["integrations/github-app-registrations"],
    catalogStatus: "planned",
  });
}
