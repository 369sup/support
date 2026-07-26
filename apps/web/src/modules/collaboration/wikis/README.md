# Wikis Bounded Context

- **Catalog path:** `collaboration/wikis`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

App-owned repository wiki pages, names, navigation, and publication state without Git-backed storage.

## Context content tree

- `collaboration/wikis` [planned]
  - Approved use cases: `list-repository-wiki-pages`, `get-repository-wiki-page`
  - Owned concepts: `RepositoryWiki`, `WikiPage`, `WikiPageName`
  - Published events: none; Wiki queries publish no events before wiki editing commands are designed.
- Planned relationships
  - `repositories/repository-features::RepositoryFeatureReference`
- Explicit exclusions: `GitRepository`, `GitCommit`, `GitBackedWikiStorage`

## Designed use cases

### `list-repository-wiki-pages` [planned]

- **Type:** `query`
- **Application boundary:** `ListRepositoryWikiPagesUseCase.listRepositoryWikiPages()`
- **Public entrypoint:** `server-api.ts#listRepositoryWikiPages`
- **Input:** A repository reference.
- **Success result:** A navigation-ordered list of visible app-owned wiki pages.
- **Expected rejections:** `repository-not-found`, `wiki-not-enabled`
- **Authorization:** Repository visibility and wiki publication state gate results.
- **Transaction:** Read-only wiki snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repository-features::RepositoryFeatureReference`
- **Published events:** `none`
- **Official evidence:** `collaboration-wikis-source-01`
- **Local policy:** Wiki content is app-owned; page-name decoding is segment-based and never resolves a Git reference.

### `get-repository-wiki-page` [planned]

- **Type:** `query`
- **Application boundary:** `GetRepositoryWikiPageUseCase.getRepositoryWikiPage()`
- **Public entrypoint:** `server-api.ts#getRepositoryWikiPage`
- **Input:** A repository reference and decoded wiki page-name segments.
- **Success result:** One visible app-owned wiki page.
- **Expected rejections:** `repository-not-found`, `wiki-not-enabled`, `wiki-page-not-found`
- **Authorization:** Repository visibility and wiki publication state gate results.
- **Transaction:** Read-only wiki snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repository-features::RepositoryFeatureReference`
- **Published events:** `none`
- **Official evidence:** `collaboration-wikis-source-01`
- **Local policy:** Wiki content is app-owned; page-name decoding is segment-based and never resolves a Git reference.

## Ownership and invariants

This context alone owns `RepositoryWiki`, `WikiPage`, `WikiPageName`.
It explicitly excludes `GitRepository`, `GitCommit`, `GitBackedWikiStorage`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

- `repositories/repository-features::RepositoryFeatureReference` (`synchronous`)

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `collaboration-wikis-source-01`: [repository wiki navigation, wiki page semantics](https://docs.github.com/en/communities/documenting-your-project-with-wikis/about-wikis) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
