import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function EnterpriseAuditLogPage(): never {
  return unavailableRoute({
    urlPattern: "/enterprises/{slug}/settings/audit-log",
    title: "Enterprise audit log",
    summary: "Review permission-filtered enterprise governance events.",
    contexts: ["governance/audit-logs", "platform/audit-storage"],
    catalogStatus: "mixed",
  });
}
