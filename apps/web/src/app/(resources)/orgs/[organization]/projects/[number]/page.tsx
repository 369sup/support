import { notFound } from "next/navigation";

export default function OrganizationProjectPage(): never {
  void {
    urlPattern: "/orgs/{organization}/projects/{number}",
    title: "Organization project",
    summary: "Open one project owned by an organization.",
    contexts: ["collaboration/projects"],
    catalogStatus: "planned",
  };
  notFound();
}
