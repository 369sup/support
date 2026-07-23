import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationProjectsPage(): never {
  return unavailableRoute({
    urlPattern: "/orgs/{organization}/projects",
    title: "Organization projects",
    summary: "List projects owned by an organization.",
    contexts: ["collaboration/projects"],
    catalogStatus: "planned",
  });
}
