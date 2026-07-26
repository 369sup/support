# Actions Route Compatibility Bounded Context

- **Catalog path:** `platform/actions-route-compatibility`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `not-applicable`

## Purpose

Canonical unavailable or redirect decisions for GitHub-style Actions URLs.

## Context content tree

- `platform/actions-route-compatibility` [planned]
  - Approved use cases: `resolve-actions-route`
  - Owned concepts: `ActionsRouteDecision`, `CanonicalUnavailableRoute`
  - Published events: none; Pure route-compatibility decisions do not publish technical events.
- Planned relationships
  - None.
- Explicit exclusions: `WorkflowSource`, `WorkflowRun`, `JobExecution`, `GitTrigger`

## Designed use cases

### `resolve-actions-route` [planned]

- **Type:** `query`
- **Application boundary:** `ResolveActionsRouteUseCase.resolveActionsRoute()`
- **Public entrypoint:** `server-api.ts#resolveActionsRoute`
- **Input:** A normalized Actions route suffix.
- **Success result:** A canonical `unsupported` or `redirect` decision with reason and canonical path.
- **Expected rejections:** `invalid-route-parameters`
- **Authorization:** None; the decision contains no protected product or Git data.
- **Transaction:** Pure read-only decision.
- **Idempotency:** Pure query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** The decision may redirect or return unavailable; it never reads workflow source or starts execution.

## Ownership and invariants

This context alone owns `ActionsRouteDecision`, `CanonicalUnavailableRoute`.
It explicitly excludes `WorkflowSource`, `WorkflowRun`, `JobExecution`, `GitTrigger`.
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
