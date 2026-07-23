import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationAuditLogPage(): never {
  return unavailableRoute({
    urlPattern: "/organizations/{organization}/settings/audit-log",
    title: "Organization audit log",
    summary: "Review permission-filtered organization governance events.",
    contexts: ["governance/audit-logs", "platform/audit-storage"],
    catalogStatus: "mixed",
  });
}
