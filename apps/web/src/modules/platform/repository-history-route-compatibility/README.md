# Repository History Route Compatibility Bounded Context

- **Catalog path:** `platform/repository-history-route-compatibility`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `not-applicable`

## Purpose

Canonical unavailable or redirect decisions for commit, history, blame, compare, and Git-derived graph URLs.

## Context content tree

- `platform/repository-history-route-compatibility` [planned]
  - Approved use cases: `resolve-repository-history-route`
  - Owned concepts: `RepositoryHistoryRouteDecision`, `CanonicalUnavailableRoute`
  - Published events: none; Pure route-compatibility decisions do not publish technical events.
- Planned relationships
  - None.
- Explicit exclusions: `Commit`, `GitHistory`, `BlameData`, `Diff`, `GitActivityMetric`

## Designed use cases

### `resolve-repository-history-route` [planned]

- **Type:** `query`
- **Application boundary:** `ResolveRepositoryHistoryRouteUseCase.resolveRepositoryHistoryRoute()`
- **Public entrypoint:** `server-api.ts#resolveRepositoryHistoryRoute`
- **Input:** A normalized history-route kind and segment array.
- **Success result:** A canonical `unsupported` or `redirect` decision with reason and canonical path.
- **Expected rejections:** `invalid-route-parameters`
- **Authorization:** None; the decision contains no protected product or Git data.
- **Transaction:** Pure read-only decision.
- **Idempotency:** Pure query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** The decision never returns commits, diffs, blame data, or Git-derived analytics.

## Ownership and invariants

This context alone owns `RepositoryHistoryRouteDecision`, `CanonicalUnavailableRoute`.
It explicitly excludes `Commit`, `GitHistory`, `BlameData`, `Diff`, `GitActivityMetric`.
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
