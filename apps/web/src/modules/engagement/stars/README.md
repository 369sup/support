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

## Ubiquitous language

The catalog reserves these terms for this context:

- `RepositoryStar`
- `StarList`
- `StarListEntry`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `RepositoryStar`, `StarList`, `StarListEntry`.
It excludes `RepositorySubscription`, `Notification`, `UserFollow`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::AccountReference` (synchronous)
- `repositories/repositories::RepositoryStarrableOperationalState` (synchronous)
- `repositories/repository-access::RepositoryReadPermission` (synchronous)
- `repositories/repositories::RepositoryVisibilityEvents` (event; events `RepositoryVisibilityChanged@1`)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `RepositoryStarred@1` (domain, planned): repository starred. contract and ordering pending activation.
- `RepositoryUnstarred@1` (domain, planned): repository unstarred. contract and ordering pending activation.
- `StarListCreated@1` (domain, planned): star list created. contract and ordering pending activation.
- `StarListUpdated@1` (domain, planned): star list updated. contract and ordering pending activation.
- `StarListDeleted@1` (domain, planned): star list deleted. contract and ordering pending activation.
- `StarListEntryAdded@1` (domain, planned): star list entry added. contract and ordering pending activation.
- `StarListEntryRemoved@1` (domain, planned): star list entry removed. contract and ordering pending activation.

## Official sources

- `engagement-stars-source-01`: [repository stars, star lists, discovery](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars) (verified 2026-07-22)
- `engagement-stars-source-02`: [stars removed by visibility changes](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility) (verified 2026-07-22)
- `engagement-stars-source-03`: [starring archived repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
