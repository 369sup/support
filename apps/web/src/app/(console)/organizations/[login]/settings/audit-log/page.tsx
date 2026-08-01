import { notFound } from "next/navigation";

export default function OrganizationAuditLogPage(): never {
  void {
    urlPattern: "/organizations/{organization}/settings/audit-log",
    title: "Organization audit log",
    summary: "Review permission-filtered organization governance events.",
    contexts: ["governance/audit-logs", "platform/audit-storage"],
    catalogStatus: "mixed",
  };
  notFound();
}
