import { notFound } from "next/navigation";

export default function RepositoryWebhooksPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/settings/hooks",
    title: "Repository webhooks",
    summary: "Manage repository-scoped webhook registrations and deliveries.",
    contexts: ["integrations/webhooks"],
    catalogStatus: "planned",
  };
  notFound();
}
