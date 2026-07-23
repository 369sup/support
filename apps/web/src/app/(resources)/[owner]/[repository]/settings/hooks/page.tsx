import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryWebhooksPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/settings/hooks",
    title: "Repository webhooks",
    summary: "Manage repository-scoped webhook registrations and deliveries.",
    contexts: ["integrations/webhooks"],
    catalogStatus: "planned",
  });
}
