import { notFound } from "next/navigation";

export default function EnterpriseRolesPage(): never {
  void {
    urlPattern: "/enterprises/{slug}/enterprise_roles",
    title: "Enterprise roles",
    summary: "Review enterprise role definitions and authorized assignments.",
    contexts: ["enterprises/enterprise-roles"],
    catalogStatus: "active",
  };
  notFound();
}
