import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationBillingPage(): never {
  return unavailableRoute({
    urlPattern: "/organizations/{organization}/settings/billing",
    title: "Organization billing",
    summary: "Review organization billing and capability entitlements.",
    contexts: ["commerce/billing", "commerce/entitlements"],
    catalogStatus: "planned",
  });
}
