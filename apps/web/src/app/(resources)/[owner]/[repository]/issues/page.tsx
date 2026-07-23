import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function IssuesPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/issues",
    title: "Issues",
    summary: "List and filter repository issues visible to the actor.",
    contexts: [
      "collaboration/issues",
      "collaboration/issue-schema",
      "collaboration/labels-and-milestones",
    ],
    catalogStatus: "planned",
  });
}
