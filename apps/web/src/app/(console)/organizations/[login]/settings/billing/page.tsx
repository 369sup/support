import { notFound } from "next/navigation";

export default function OrganizationBillingPage(): never {
  void {
    urlPattern: "/organizations/{organization}/settings/billing",
    title: "Organization billing",
    summary: "Review organization billing and capability entitlements.",
    contexts: ["commerce/billing", "commerce/entitlements"],
    catalogStatus: "planned",
  };
  notFound();
}
