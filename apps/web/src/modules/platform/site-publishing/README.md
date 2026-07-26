# Site Publishing Bounded Context

- **Catalog path:** `platform/site-publishing`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

App-owned repository site publication metadata, domains, and publication status without Git-backed builds.

## Context content tree

- `platform/site-publishing` [planned]
  - Approved use cases: `get-repository-site-publication`
  - Owned concepts: `SitePublication`, `PublicationStatus`, `PublicationDomain`
  - Published events: none; Publication status queries do not publish events before publication commands are designed.
- Planned relationships
  - `repositories/repositories::RepositoryReference`
- Explicit exclusions: `GitSourceTree`, `SourceBuild`, `WorkflowJob`, `GitHubPagesBuild`

## Designed use cases

### `get-repository-site-publication` [planned]

- **Type:** `query`
- **Application boundary:** `GetRepositorySitePublicationUseCase.getRepositorySitePublication()`
- **Public entrypoint:** `server-api.ts#getRepositorySitePublication`
- **Input:** A repository reference.
- **Success result:** The app-owned publication status and canonical public domain, if configured.
- **Expected rejections:** `repository-not-found`, `publication-not-configured`
- **Authorization:** Public publication metadata is readable; private configuration requires repository administration permission.
- **Transaction:** Read-only publication snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repositories::RepositoryReference`
- **Published events:** `none`
- **Official evidence:** `platform-site-publishing-source-01`
- **Local policy:** Publication never reads Git content or claims a GitHub Pages build; only app-owned content can be published.

## Ownership and invariants

This context alone owns `SitePublication`, `PublicationStatus`, `PublicationDomain`.
It explicitly excludes `GitSourceTree`, `SourceBuild`, `WorkflowJob`, `GitHubPagesBuild`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

- `repositories/repositories::RepositoryReference` (`synchronous`)

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `platform-site-publishing-source-01`: [repository site publication, publication status navigation](https://docs.github.com/en/pages/getting-started-with-github-pages) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
