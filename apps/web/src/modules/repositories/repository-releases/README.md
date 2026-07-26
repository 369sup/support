# Repository Releases Bounded Context

- **Catalog path:** `repositories/repository-releases`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Repository release metadata, release tags as opaque labels, and release-asset references without owning Git tags.

## Context content tree

- `repositories/repository-releases` [planned]
  - Approved use cases: `list-repository-releases`, `get-latest-repository-release`, `get-repository-release-by-tag`, `get-release-asset-download`
  - Owned concepts: `RepositoryRelease`, `ReleaseTagLabel`, `ReleaseAssetReference`
  - Published events: none; Release queries publish no events before release lifecycle commands are designed.
- Planned relationships
  - `repositories/repositories::RepositoryReference`
  - `platform/media-storage::ReleaseAssetStorageReference`
- Explicit exclusions: `GitTag`, `Commit`, `BinaryAssetStorage`

## Designed use cases

### `list-repository-releases` [planned]

- **Type:** `query`
- **Application boundary:** `ListRepositoryReleasesUseCase.listRepositoryReleases()`
- **Public entrypoint:** `server-api.ts#listRepositoryReleases`
- **Input:** A repository reference and page cursor.
- **Success result:** A page of visible release metadata.
- **Expected rejections:** `repository-not-found`, `repository-not-readable`
- **Authorization:** Repository visibility and release publication state gate all results.
- **Transaction:** Read-only release snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repositories::RepositoryReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repository-releases-source-01`
- **Local policy:** Release tag labels are opaque product metadata and never resolve a Git reference or commit.

### `get-latest-repository-release` [planned]

- **Type:** `query`
- **Application boundary:** `GetLatestRepositoryReleaseUseCase.getLatestRepositoryRelease()`
- **Public entrypoint:** `server-api.ts#getLatestRepositoryRelease`
- **Input:** A repository reference.
- **Success result:** The latest visible published release.
- **Expected rejections:** `release-not-found`
- **Authorization:** Repository visibility and release publication state gate all results.
- **Transaction:** Read-only release snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repositories::RepositoryReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repository-releases-source-01`
- **Local policy:** Release tag labels are opaque product metadata and never resolve a Git reference or commit.

### `get-repository-release-by-tag` [planned]

- **Type:** `query`
- **Application boundary:** `GetRepositoryReleaseByTagUseCase.getRepositoryReleaseByTag()`
- **Public entrypoint:** `server-api.ts#getRepositoryReleaseByTag`
- **Input:** A repository reference and opaque release tag label.
- **Success result:** The matching visible published release.
- **Expected rejections:** `release-not-found`
- **Authorization:** Repository visibility and release publication state gate all results.
- **Transaction:** Read-only release snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repositories::RepositoryReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repository-releases-source-01`
- **Local policy:** Release tag labels are opaque product metadata and never resolve a Git reference or commit.

### `get-release-asset-download` [planned]

- **Type:** `query`
- **Application boundary:** `GetReleaseAssetDownloadUseCase.getReleaseAssetDownload()`
- **Public entrypoint:** `server-api.ts#getReleaseAssetDownload`
- **Input:** A repository reference, opaque release tag label, and asset path segments.
- **Success result:** An authorized asset-download reference.
- **Expected rejections:** `release-not-found`, `release-asset-not-found`
- **Authorization:** Repository visibility and release publication state gate all results.
- **Transaction:** Read-only release snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repositories::RepositoryReference`, `platform/media-storage::ReleaseAssetStorageReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repository-releases-source-01`
- **Local policy:** Release tag labels are opaque product metadata and never resolve a Git reference or commit.

## Ownership and invariants

This context alone owns `RepositoryRelease`, `ReleaseTagLabel`, `ReleaseAssetReference`.
It explicitly excludes `GitTag`, `Commit`, `BinaryAssetStorage`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

- `repositories/repositories::RepositoryReference` (`synchronous`)
- `platform/media-storage::ReleaseAssetStorageReference` (`synchronous`)

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `repositories-repository-releases-source-01`: [release list, latest release, tagged release, release asset links](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
