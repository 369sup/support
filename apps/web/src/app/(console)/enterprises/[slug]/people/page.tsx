import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function EnterprisePeoplePage(): never {
  return unavailableRoute({
    urlPattern: "/enterprises/{slug}/people",
    title: "Enterprise people",
    summary: "List enterprise memberships visible to an authorized administrator.",
    contexts: ["enterprises/enterprise-memberships"],
    catalogStatus: "active",
  });
}
