import { notFound } from "next/navigation";

export default function EnterprisePeoplePage(): never {
  void {
    urlPattern: "/enterprises/{slug}/people",
    title: "Enterprise people",
    summary: "List enterprise memberships visible to an authorized administrator.",
    contexts: ["enterprises/enterprise-memberships"],
    catalogStatus: "active",
  };
  notFound();
}
