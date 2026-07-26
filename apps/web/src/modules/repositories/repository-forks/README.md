# Repository Forks Bounded Context

- **Catalog path:** `repositories/repository-forks`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Repository fork relationships and visibility metadata without provisioning or owning Git history.

## Context content tree

- `repositories/repository-forks` [planned]
  - Approved use cases: `list-repository-forks`
  - Owned concepts: `RepositoryForkRelationship`, `ForkNetworkReference`, `ForkVisibility`
  - Published events: none; Fork relationship queries publish no events before relationship commands are designed.
- Planned relationships
  - `repositories/repositories::RepositoryReference`
- Explicit exclusions: `GitHistoryProvisioning`, `GitObjectCopy`, `TemplateProvisioning`

## Designed use cases

### `list-repository-forks` [planned]

- **Type:** `query`
- **Application boundary:** `ListRepositoryForksUseCase.listRepositoryForks()`
- **Public entrypoint:** `server-api.ts#listRepositoryForks`
- **Input:** A repository reference and page cursor.
- **Success result:** A visibility-filtered page of fork relationship metadata.
- **Expected rejections:** `repository-not-found`, `repository-not-readable`
- **Authorization:** Both source and fork repository visibility are evaluated by repository policy.
- **Transaction:** Read-only relationship snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repositories::RepositoryReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repository-forks-source-01`
- **Local policy:** The relationship records ancestry metadata only and never copies or reads Git history.

## Ownership and invariants

This context alone owns `RepositoryForkRelationship`, `ForkNetworkReference`, `ForkVisibility`.
It explicitly excludes `GitHistoryProvisioning`, `GitObjectCopy`, `TemplateProvisioning`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

- `repositories/repositories::RepositoryReference` (`synchronous`)

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `repositories-repository-forks-source-01`: [fork relationships, fork visibility](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-permissions-and-visibility-of-forks) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
