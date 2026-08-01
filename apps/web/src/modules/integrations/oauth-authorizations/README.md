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
    - `OAuthPolicyConstraints`
    - `AuthorizationScope`
    - `AuthorizationRevocation`
  - Business rules and invariants
    - `OAuthPolicyConstraints` controls OAuth authorization eligibility for organization-owned flows, including outside-collaborator restrictions and optional scope allow-lists before consent.
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

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `OAuthAuthorization`, `OAuthPolicyConstraints`, `AuthorizationScope`, `AuthorizationRevocation`.
It excludes `GitHubAppInstallation`, `InteractiveSession`, `TokenStorageAdapter`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `integrations/oauth-app-registrations::OAuthClientReference` (synchronous)
- `identity/accounts::AuthorizingUserReference` (synchronous)
- `organizations/organization-policies::OAuthPolicyConstraints` (synchronous)

## Official sources

- `integrations-oauth-authorizations-source-01`: [OAuth App user authorization, OAuth scopes, authorization revocation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
