# Pull Request Route Compatibility Bounded Context

- **Catalog path:** `platform/pull-request-route-compatibility`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `not-applicable`

## Purpose

Canonical unavailable or redirect decisions for pull-request URLs.

## Context content tree

- `platform/pull-request-route-compatibility` [planned]
  - Approved use cases: `resolve-pull-request-route`
  - Owned concepts: `PullRequestRouteDecision`, `CanonicalUnavailableRoute`
  - Published events: none; Pure route-compatibility decisions do not publish technical events.
- Planned relationships
  - None.
- Explicit exclusions: `PullRequest`, `Diff`, `CommitLinkage`, `CodeReview`

## Designed use cases

### `resolve-pull-request-route` [planned]

- **Type:** `query`
- **Application boundary:** `ResolvePullRequestRouteUseCase.resolvePullRequestRoute()`
- **Public entrypoint:** `server-api.ts#resolvePullRequestRoute`
- **Input:** A normalized pull-request route suffix.
- **Success result:** A canonical `unsupported` or `redirect` decision with reason and canonical path.
- **Expected rejections:** `invalid-route-parameters`
- **Authorization:** None; the decision contains no protected product or Git data.
- **Transaction:** Pure read-only decision.
- **Idempotency:** Pure query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** The decision never returns pull-request, diff, commit-linkage, or review semantics.

## Ownership and invariants

This context alone owns `PullRequestRouteDecision`, `CanonicalUnavailableRoute`.
It explicitly excludes `PullRequest`, `Diff`, `CommitLinkage`, `CodeReview`.
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
