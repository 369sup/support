import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function BillingSettingsPage(): never {
  return unavailableRoute({
    urlPattern: "/settings/billing",
    title: "Billing",
    summary: "Review account billing and capability entitlements.",
    contexts: ["commerce/billing", "commerce/entitlements"],
    catalogStatus: "planned",
  });
}
