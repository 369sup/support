import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function RepositoryReleaseAssetPage(): never {
  return unavailableRoute({
    urlPattern: "/{owner}/{repository}/releases/download/{*assetPath}",
    title: "Repository release asset",
    summary:
      "Reserve GitHub-style release asset routes while release downloads remain deferred.",
    contexts: [],
    catalogStatus: "deferred",
  });
}
