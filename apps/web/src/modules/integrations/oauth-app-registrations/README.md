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

## Ubiquitous language

The catalog reserves these terms for this context:

- `OAuthClient`
- `OAuthAppOwnerReference`
- `OAuthCallbackConfiguration`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `OAuthClient`, `OAuthAppOwnerReference`, `OAuthCallbackConfiguration`.
It excludes `OAuthAuthorization`, `GitHubAppRegistration`, `TokenStorageAdapter`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::UserOAuthAppOwner` (synchronous)
- `organizations/organizations::OrganizationOAuthAppOwner` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `OAuthClientRegistered@1` (domain, planned): oauth client registered. contract and ordering pending activation.
- `OAuthClientUpdated@1` (domain, planned): oauth client updated. contract and ordering pending activation.
- `OAuthClientDeleted@1` (domain, planned): oauth client deleted. contract and ordering pending activation.

## Official sources

- `integrations-oauth-app-registrations-source-01`: [OAuth App registration, OAuth client ownership, callback configuration](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
