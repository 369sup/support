import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationWebhooksPage(): never {
  return unavailableRoute({
    urlPattern: "/organizations/{organization}/settings/hooks",
    title: "Organization webhooks",
    summary: "Manage organization-scoped webhook registrations and deliveries.",
    contexts: ["integrations/webhooks"],
    catalogStatus: "planned",
  });
}
