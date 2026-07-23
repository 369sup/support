import { notFound } from "next/navigation";

export default function OrganizationWebhooksPage(): never {
  void {
    urlPattern: "/organizations/{organization}/settings/hooks",
    title: "Organization webhooks",
    summary: "Manage organization-scoped webhook registrations and deliveries.",
    contexts: ["integrations/webhooks"],
    catalogStatus: "planned",
  };
  notFound();
}
