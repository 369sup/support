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

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `UserFollow`, `OrganizationFollow`.
It excludes `RepositoryStar`, `RepositorySubscription`, `ActivityFeed`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::AccountReference` (synchronous)
- `organizations/organizations::OrganizationReference` (synchronous)

## Official sources

- `identity-social-graph-source-01`: [following people](https://docs.github.com/en/get-started/exploring-projects-on-github/following-people) (verified 2026-07-23)
- `identity-social-graph-source-02`: [following organizations](https://docs.github.com/en/enterprise-cloud@latest/get-started/exploring-projects-on-github/following-organizations) (verified 2026-07-23; preview)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
