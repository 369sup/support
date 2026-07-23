import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OrganizationProjectPage(): never {
  return unavailableRoute({
    urlPattern: "/orgs/{organization}/projects/{number}",
    title: "Organization project",
    summary: "Open one project owned by an organization.",
    contexts: ["collaboration/projects"],
    catalogStatus: "planned",
  });
}
