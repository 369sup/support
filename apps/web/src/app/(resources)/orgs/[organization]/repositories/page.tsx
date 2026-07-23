import { notFound } from "next/navigation";

export default function OrganizationRepositoriesPage(): never {
  void {
    urlPattern: "/orgs/{organization}/repositories",
    title: "Organization repositories",
    summary: "List repositories owned by an organization and visible to the actor.",
    contexts: ["organizations/organizations", "repositories/repositories"],
    catalogStatus: "active",
  };
  notFound();
}
