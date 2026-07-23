import { notFound } from "next/navigation";

export default function EnterpriseTeamsPage(): never {
  void {
    urlPattern: "/enterprises/{slug}/teams",
    title: "Enterprise teams",
    summary: "List enterprise-owned team definitions and organization connections.",
    contexts: ["enterprises/enterprise-teams"],
    catalogStatus: "planned",
  };
  notFound();
}
