# Profiles Bounded Context

- **Catalog path:** `identity/profiles`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Public and private personal profiles, profile status, and pinned-item presentation.

## Context content tree

- `identity/profiles` [planned]
  - Purpose: Public and private personal profiles, profile status, and pinned-item presentation.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `UserProfile`
    - `ProfileVisibility`
    - `ProfileStatus`
    - `PinnedItemSet`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `ProfileUpdated@1` [planned]: profile updated.
    - `ProfileVisibilityChanged@1` [planned]: profile visibility changed.
    - `ProfileStatusChanged@1` [planned]: profile status changed.
    - `PinnedItemsChanged@1` [planned]: pinned items changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::AccountReference` (synchronous)
- Explicit exclusions
  - `AccountLifecycle`
  - `RepositoryStar`
  - `Project`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `UserProfile`, `ProfileVisibility`, `ProfileStatus`, `PinnedItemSet`.
It excludes `AccountLifecycle`, `RepositoryStar`, `Project`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::AccountReference` (synchronous)

## Official sources

- `identity-profiles-source-01`: [profile, profile visibility, pinned items](https://docs.github.com/en/account-and-profile/concepts/personal-profile) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
