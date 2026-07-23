import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function EnterpriseRolesPage(): never {
  return unavailableRoute({
    urlPattern: "/enterprises/{slug}/enterprise_roles",
    title: "Enterprise roles",
    summary: "Review enterprise role definitions and authorized assignments.",
    contexts: ["enterprises/enterprise-roles"],
    catalogStatus: "active",
  });
}
