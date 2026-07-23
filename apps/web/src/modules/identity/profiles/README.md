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

## Ubiquitous language

The catalog reserves these terms for this context:

- `UserProfile`
- `ProfileVisibility`
- `ProfileStatus`
- `PinnedItemSet`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `UserProfile`, `ProfileVisibility`, `ProfileStatus`, `PinnedItemSet`.
It excludes `AccountLifecycle`, `RepositoryStar`, `Project`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::AccountReference` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `ProfileUpdated@1` (domain, planned): profile updated. contract and ordering pending activation.
- `ProfileVisibilityChanged@1` (domain, planned): profile visibility changed. contract and ordering pending activation.
- `ProfileStatusChanged@1` (domain, planned): profile status changed. contract and ordering pending activation.
- `PinnedItemsChanged@1` (domain, planned): pinned items changed. contract and ordering pending activation.

## Official sources

- `identity-profiles-source-01`: [profile, profile visibility, pinned items](https://docs.github.com/en/account-and-profile/concepts/personal-profile) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
