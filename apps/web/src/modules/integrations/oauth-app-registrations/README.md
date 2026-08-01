# Oauth App Registrations Bounded Context

- **Catalog path:** `integrations/oauth-app-registrations`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

OAuth App registration, ownership, callback configuration, and client lifecycle.

## Context content tree

- `integrations/oauth-app-registrations` [planned]
  - Purpose: OAuth App registration, ownership, callback configuration, and client lifecycle.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `OAuthClient`
    - `OAuthAppOwnerReference`
    - `OAuthCallbackConfiguration`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `OAuthClientRegistered@1` [planned]: oauth client registered.
    - `OAuthClientUpdated@1` [planned]: oauth client updated.
    - `OAuthClientDeleted@1` [planned]: oauth client deleted.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::UserOAuthAppOwner` (synchronous)
    - `organizations/organizations::OrganizationOAuthAppOwner` (synchronous)
- Explicit exclusions
  - `OAuthAuthorization`
  - `GitHubAppRegistration`
  - `TokenStorageAdapter`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `OAuthClient`, `OAuthAppOwnerReference`, `OAuthCallbackConfiguration`.
It excludes `OAuthAuthorization`, `GitHubAppRegistration`, `TokenStorageAdapter`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::UserOAuthAppOwner` (synchronous)
- `organizations/organizations::OrganizationOAuthAppOwner` (synchronous)

## Official sources

- `integrations-oauth-app-registrations-source-01`: [OAuth App registration, OAuth client ownership, callback configuration](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
