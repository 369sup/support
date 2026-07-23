import { notFound } from "next/navigation";

export default function EnterpriseOrganizationsPage(): never {
  void {
    urlPattern: "/enterprises/{slug}/organizations",
    title: "Enterprise organizations",
    summary: "List organizations owned by an enterprise and visible to the actor.",
    contexts: ["enterprises/enterprises", "organizations/organizations"],
    catalogStatus: "active",
  };
  notFound();
}
