import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function OwnerPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}",
    title: "Owner profile",
    summary: "Resolve a user or organization namespace and its supported profile tabs.",
    contexts: [
      "identity/accounts",
      "identity/profiles",
      "identity/social-graph",
      "organizations/organizations",
      "repositories/repositories",
      "collaboration/projects",
      "engagement/stars",
    ],
    catalogStatus: "mixed",
  });
}
