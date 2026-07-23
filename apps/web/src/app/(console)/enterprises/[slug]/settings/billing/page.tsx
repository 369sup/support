import { notFound } from "next/navigation";

export default function EnterpriseBillingPage(): never {
  void {
    urlPattern: "/enterprises/{slug}/settings/billing",
    title: "Enterprise billing",
    summary: "Review enterprise billing and capability entitlements.",
    contexts: ["commerce/billing", "commerce/entitlements"],
    catalogStatus: "planned",
  };
  notFound();
}
