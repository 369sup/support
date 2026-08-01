import { notFound } from "next/navigation";

export default function OwnerPage(): never {
  void {
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
  };
  notFound();
}
