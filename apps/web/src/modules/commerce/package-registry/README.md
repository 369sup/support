# Package Registry Bounded Context

- **Catalog path:** `commerce/package-registry`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Repository-linked package metadata, versions, visibility, and catalog navigation without owning package payloads.

## Context content tree

- `commerce/package-registry` [planned]
  - Approved use cases: `list-repository-packages`, `get-repository-package`
  - Owned concepts: `PackageMetadata`, `PackageVersionMetadata`, `RepositoryPackageLink`
  - Published events: none; Package metadata queries do not publish events before package administration is designed.
- Planned relationships
  - `repositories/repositories::RepositoryReference`
- Explicit exclusions: `PackagePayload`, `BuildArtifact`, `GitContent`

## Designed use cases

### `list-repository-packages` [planned]

- **Type:** `query`
- **Application boundary:** `ListRepositoryPackagesUseCase.listRepositoryPackages()`
- **Public entrypoint:** `server-api.ts#listRepositoryPackages`
- **Input:** A repository reference and page cursor.
- **Success result:** A visibility-filtered page of linked package metadata.
- **Expected rejections:** `repository-not-found`, `repository-not-readable`
- **Authorization:** Repository visibility and package visibility are evaluated by their owning policies.
- **Transaction:** Read-only metadata snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repositories::RepositoryReference`
- **Published events:** `none`
- **Official evidence:** `commerce-package-registry-source-01`
- **Local policy:** This context does not store or serve package payloads and does not infer build provenance.

### `get-repository-package` [planned]

- **Type:** `query`
- **Application boundary:** `GetRepositoryPackageUseCase.getRepositoryPackage()`
- **Public entrypoint:** `server-api.ts#getRepositoryPackage`
- **Input:** A repository reference and package identifier.
- **Success result:** One visible package metadata record with version summaries.
- **Expected rejections:** `repository-not-found`, `repository-not-readable`, `package-not-found`
- **Authorization:** Repository visibility and package visibility are evaluated by their owning policies.
- **Transaction:** Read-only metadata snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repositories::RepositoryReference`
- **Published events:** `none`
- **Official evidence:** `commerce-package-registry-source-01`
- **Local policy:** This context does not store or serve package payloads and does not infer build provenance.

## Ownership and invariants

This context alone owns `PackageMetadata`, `PackageVersionMetadata`, `RepositoryPackageLink`.
It explicitly excludes `PackagePayload`, `BuildArtifact`, `GitContent`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

- `repositories/repositories::RepositoryReference` (`synchronous`)

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `commerce-package-registry-source-01`: [package metadata, repository package navigation](https://docs.github.com/en/packages/learn-github-packages/viewing-packages) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
