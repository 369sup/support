import { notFound } from "next/navigation";

export default function OrganizationPeoplePage(): never {
  void {
    urlPattern: "/orgs/{organization}/people",
    title: "Organization people",
    summary: "List organization memberships visible to the actor.",
    contexts: ["organizations/organization-memberships"],
    catalogStatus: "active",
  };
  notFound();
}
