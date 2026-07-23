import { notFound } from "next/navigation";

export default function OrganizationProjectsPage(): never {
  void {
    urlPattern: "/orgs/{organization}/projects",
    title: "Organization projects",
    summary: "List projects owned by an organization.",
    contexts: ["collaboration/projects"],
    catalogStatus: "planned",
  };
  notFound();
}
