import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationInstallationPage(): never {
  return unavailableRoute({
    urlPattern:
      "/organizations/{organization}/settings/installations/{installationId}",
    title: "Organization installation",
    summary: "Review one GitHub App installation and its organization resource access.",
    contexts: ["integrations/github-app-installations"],
    catalogStatus: "planned",
  });
}
