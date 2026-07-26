# Repository Traffic Bounded Context

- **Catalog path:** `projections/repository-traffic`
- **Kind:** `projection`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Privacy-bounded repository web traffic summaries derived from Support telemetry, not Git activity.

## Context content tree

- `projections/repository-traffic` [planned]
  - Approved use cases: `get-repository-web-traffic`
  - Owned concepts: `RepositoryTrafficSummary`, `TrafficViewMetric`, `TrafficCloneMetric`
  - Published events: none; Traffic is a read-model context and does not publish product facts.
- Planned relationships
  - `repositories/repository-access::EffectiveReadPermission`
- Explicit exclusions: `GitActivityMetric`, `ContributorCodeMetric`, `VisitorIdentity`

## Designed use cases

### `get-repository-web-traffic` [planned]

- **Type:** `query`
- **Application boundary:** `GetRepositoryWebTrafficUseCase.getRepositoryWebTraffic()`
- **Public entrypoint:** `server-api.ts#getRepositoryWebTraffic`
- **Input:** A repository reference and cataloged aggregation window.
- **Success result:** Aggregate Support web-view and clone-equivalent navigation metrics.
- **Expected rejections:** `repository-not-found`, `repository-not-readable`
- **Authorization:** Repository administration permission is required for non-public traffic summaries.
- **Transaction:** Read-only aggregate snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repository-access::EffectiveReadPermission`
- **Published events:** `none`
- **Official evidence:** `projections-repository-traffic-source-01`
- **Local policy:** Metrics never expose visitor identity or claim Git fetch, clone, commit, or contributor activity.

## Ownership and invariants

This context alone owns `RepositoryTrafficSummary`, `TrafficViewMetric`, `TrafficCloneMetric`.
It explicitly excludes `GitActivityMetric`, `ContributorCodeMetric`, `VisitorIdentity`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

- `repositories/repository-access::EffectiveReadPermission` (`synchronous`)

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `projections-repository-traffic-source-01`: [repository traffic views, aggregate view and clone metrics](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
