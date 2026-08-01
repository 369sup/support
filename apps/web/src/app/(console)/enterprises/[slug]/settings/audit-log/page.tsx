import { notFound } from "next/navigation";

export default function EnterpriseAuditLogPage(): never {
  void {
    urlPattern: "/enterprises/{slug}/settings/audit-log",
    title: "Enterprise audit log",
    summary: "Review permission-filtered enterprise governance events.",
    contexts: ["governance/audit-logs", "platform/audit-storage"],
    catalogStatus: "mixed",
  };
  notFound();
}
