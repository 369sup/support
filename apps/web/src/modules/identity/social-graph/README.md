# Social Graph Bounded Context

- **Catalog path:** `identity/social-graph`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Following relationships between users and organizations.

## Context content tree

- `identity/social-graph` [planned]
  - Purpose: Following relationships between users and organizations.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `UserFollow`
    - `OrganizationFollow`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `UserFollowed@1` [planned]: user followed.
    - `UserUnfollowed@1` [planned]: user unfollowed.
    - `OrganizationFollowed@1` [planned]: organization followed.
    - `OrganizationUnfollowed@1` [planned]: organization unfollowed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::AccountReference` (synchronous)
    - `organizations/organizations::OrganizationReference` (synchronous)
- Explicit exclusions
  - `RepositoryStar`
  - `RepositorySubscription`
  - `ActivityFeed`

## Ubiquitous language

The catalog reserves these terms for this context:

- `UserFollow`
- `OrganizationFollow`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `UserFollow`, `OrganizationFollow`.
It excludes `RepositoryStar`, `RepositorySubscription`, `ActivityFeed`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::AccountReference` (synchronous)
- `organizations/organizations::OrganizationReference` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `UserFollowed@1` (domain, planned): user followed. contract and ordering pending activation.
- `UserUnfollowed@1` (domain, planned): user unfollowed. contract and ordering pending activation.
- `OrganizationFollowed@1` (domain, planned): organization followed. contract and ordering pending activation.
- `OrganizationUnfollowed@1` (domain, planned): organization unfollowed. contract and ordering pending activation.

## Official sources

- `identity-social-graph-source-01`: [following people, following organizations](https://docs.github.com/en/account-and-profile) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
