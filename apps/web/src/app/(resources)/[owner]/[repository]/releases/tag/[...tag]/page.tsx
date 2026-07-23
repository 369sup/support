import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function TaggedRepositoryReleasePage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/releases/tag/{*tag}",
    title: "Tagged repository release",
    summary:
      "Reserve GitHub-style tagged release routes while release behavior remains deferred.",
    contexts: [],
    catalogStatus: "deferred",
  });
}
