# Repository Reference Route Compatibility Bounded Context

- **Catalog path:** `platform/repository-reference-route-compatibility`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `not-applicable`

## Purpose

Canonical unavailable or redirect decisions for branch and tag URLs.

## Context content tree

- `platform/repository-reference-route-compatibility` [planned]
  - Approved use cases: `resolve-repository-reference-route`
  - Owned concepts: `RepositoryReferenceRouteDecision`, `CanonicalUnavailableRoute`
  - Published events: none; Pure route-compatibility decisions do not publish technical events.
- Planned relationships
  - None.
- Explicit exclusions: `GitBranch`, `GitTag`, `GitReference`, `CommitTarget`

## Designed use cases

### `resolve-repository-reference-route` [planned]

- **Type:** `query`
- **Application boundary:** `ResolveRepositoryReferenceRouteUseCase.resolveRepositoryReferenceRoute()`
- **Public entrypoint:** `server-api.ts#resolveRepositoryReferenceRoute`
- **Input:** A normalized reference-route kind and segment array.
- **Success result:** A canonical `unsupported` or `redirect` decision with reason and canonical path.
- **Expected rejections:** `invalid-route-parameters`
- **Authorization:** None; the decision contains no protected product or Git data.
- **Transaction:** Pure read-only decision.
- **Idempotency:** Pure query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** The decision never resolves a branch, tag, reference, or commit target.

## Ownership and invariants

This context alone owns `RepositoryReferenceRouteDecision`, `CanonicalUnavailableRoute`.
It explicitly excludes `GitBranch`, `GitTag`, `GitReference`, `CommitTarget`.
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
