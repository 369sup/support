# Repository Content Route Compatibility Bounded Context

- **Catalog path:** `platform/repository-content-route-compatibility`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `not-applicable`

## Purpose

Canonical unavailable or redirect decisions for tree, blob, raw, and source-archive URLs.

## Context content tree

- `platform/repository-content-route-compatibility` [planned]
  - Approved use cases: `resolve-repository-content-route`
  - Owned concepts: `RepositoryContentRouteDecision`, `CanonicalUnavailableRoute`
  - Published events: none; Pure route-compatibility decisions do not publish technical events.
- Planned relationships
  - None.
- Explicit exclusions: `GitObject`, `RepositoryFile`, `RawBlob`, `SourceArchive`

## Designed use cases

### `resolve-repository-content-route` [planned]

- **Type:** `query`
- **Application boundary:** `ResolveRepositoryContentRouteUseCase.resolveRepositoryContentRoute()`
- **Public entrypoint:** `server-api.ts#resolveRepositoryContentRoute`
- **Input:** A normalized content-route kind and segment array.
- **Success result:** A canonical `unsupported` or `redirect` decision with reason and canonical path.
- **Expected rejections:** `invalid-route-parameters`
- **Authorization:** None; the decision contains no protected product or Git data.
- **Transaction:** Pure read-only decision.
- **Idempotency:** Pure query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** The decision never returns Git objects, repository files, raw content, or archives.

## Ownership and invariants

This context alone owns `RepositoryContentRouteDecision`, `CanonicalUnavailableRoute`.
It explicitly excludes `GitObject`, `RepositoryFile`, `RawBlob`, `SourceArchive`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

None.

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

Not applicable for this technical route-decision capability.

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
