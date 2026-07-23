import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function EnterpriseBillingPage(): never {
  return unavailableRoute({
    urlPattern: "/enterprises/{slug}/settings/billing",
    title: "Enterprise billing",
    summary: "Review enterprise billing and capability entitlements.",
    contexts: ["commerce/billing", "commerce/entitlements"],
    catalogStatus: "planned",
  });
}
