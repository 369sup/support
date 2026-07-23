import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryCustomPropertiesPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/custom-properties",
    title: "Repository custom properties",
    summary: "Review organization-defined custom property values for a repository.",
    contexts: ["organizations/custom-properties"],
    catalogStatus: "planned",
  });
}
