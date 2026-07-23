import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function NewIssuePage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/issues/new",
    title: "New issue",
    summary: "Create an issue using the repository's enabled issue schema.",
    contexts: ["collaboration/issues", "collaboration/issue-schema"],
    catalogStatus: "planned",
  });
}
