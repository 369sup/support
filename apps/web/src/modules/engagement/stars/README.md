# Stars Bounded Context

- **Catalog path:** `engagement/stars`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Repository starring and user-defined star lists for discovery and collection.

## Context content tree

- `engagement/stars` [planned]
  - Purpose: Repository starring and user-defined star lists for discovery and collection.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `RepositoryStar`
    - `StarList`
    - `StarListEntry`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `RepositoryStarred@1` [planned]: repository starred.
    - `RepositoryUnstarred@1` [planned]: repository unstarred.
    - `StarListCreated@1` [planned]: star list created.
    - `StarListUpdated@1` [planned]: star list updated.
    - `StarListDeleted@1` [planned]: star list deleted.
    - `StarListEntryAdded@1` [planned]: star list entry added.
    - `StarListEntryRemoved@1` [planned]: star list entry removed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::AccountReference` (synchronous)
    - `repositories/repositories::RepositoryStarrableOperationalState` (synchronous)
    - `repositories/repository-access::RepositoryReadPermission` (synchronous)
    - `repositories/repositories::RepositoryVisibilityEvents` (event; events `RepositoryVisibilityChanged@1`)
- Explicit exclusions
  - `RepositorySubscription`
  - `Notification`
  - `UserFollow`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `RepositoryStar`, `StarList`, `StarListEntry`.
It excludes `RepositorySubscription`, `Notification`, `UserFollow`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::AccountReference` (synchronous)
- `repositories/repositories::RepositoryStarrableOperationalState` (synchronous)
- `repositories/repository-access::RepositoryReadPermission` (synchronous)
- `repositories/repositories::RepositoryVisibilityEvents` (event; events `RepositoryVisibilityChanged@1`)

## Official sources

- `engagement-stars-source-01`: [repository stars, star lists, discovery](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars) (verified 2026-07-22)
- `engagement-stars-source-02`: [stars removed by visibility changes](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility) (verified 2026-07-22)
- `engagement-stars-source-03`: [starring archived repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
