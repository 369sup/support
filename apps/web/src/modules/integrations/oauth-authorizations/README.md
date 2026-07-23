# Oauth Authorizations Bounded Context

- **Catalog path:** `integrations/oauth-authorizations`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

User authorization of registered OAuth Apps, scopes, approval, and revocation.

## Context content tree

- `integrations/oauth-authorizations` [planned]
  - Purpose: User authorization of registered OAuth Apps, scopes, approval, and revocation.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `OAuthAuthorization`
    - `AuthorizationScope`
    - `AuthorizationRevocation`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `OAuthAuthorizationGranted@1` [planned]: oauth authorization granted.
    - `OAuthAuthorizationRevoked@1` [planned]: oauth authorization revoked.
    - `OAuthScopesChanged@1` [planned]: oauth scopes changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `integrations/oauth-app-registrations::OAuthClientReference` (synchronous)
    - `identity/accounts::AuthorizingUserReference` (synchronous)
    - `organizations/organization-policies::OAuthPolicyConstraints` (synchronous)
- Explicit exclusions
  - `GitHubAppInstallation`
  - `InteractiveSession`
  - `TokenStorageAdapter`

## Ubiquitous language

The catalog reserves these terms for this context:

- `OAuthAuthorization`
- `AuthorizationScope`
- `AuthorizationRevocation`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `OAuthAuthorization`, `AuthorizationScope`, `AuthorizationRevocation`.
It excludes `GitHubAppInstallation`, `InteractiveSession`, `TokenStorageAdapter`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `integrations/oauth-app-registrations::OAuthClientReference` (synchronous)
- `identity/accounts::AuthorizingUserReference` (synchronous)
- `organizations/organization-policies::OAuthPolicyConstraints` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `OAuthAuthorizationGranted@1` (domain, planned): oauth authorization granted. contract and ordering pending activation.
- `OAuthAuthorizationRevoked@1` (domain, planned): oauth authorization revoked. contract and ordering pending activation.
- `OAuthScopesChanged@1` (domain, planned): oauth scopes changed. contract and ordering pending activation.

## Official sources

- `integrations-oauth-authorizations-source-01`: [OAuth App user authorization, OAuth scopes, authorization revocation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
