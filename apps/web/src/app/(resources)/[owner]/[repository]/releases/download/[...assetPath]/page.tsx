import { notFound } from "next/navigation";

export default function RepositoryReleaseAssetPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/releases/download/{*assetPath}",
    title: "Repository release asset",
    summary:
      "Reserve GitHub-style release asset routes while release downloads remain deferred.",
    contexts: [],
    catalogStatus: "deferred",
  };
  notFound();
}
