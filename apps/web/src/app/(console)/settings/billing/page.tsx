import { notFound } from "next/navigation";

export default function BillingSettingsPage(): never {
  void {
    urlPattern: "/settings/billing",
    title: "Billing",
    summary: "Review account billing and capability entitlements.",
    contexts: ["commerce/billing", "commerce/entitlements"],
    catalogStatus: "planned",
  };
  notFound();
}
