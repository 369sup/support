# Authentication Bounded Context

- **Catalog path:** `identity/authentication`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Credentials, sessions, two-factor authentication, recovery, and external login binding.

## Context content tree

- `identity/authentication` [planned]
  - Purpose: Credentials, sessions, two-factor authentication, recovery, and external login binding.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `Credential`
    - `Session`
    - `TwoFactorConfiguration`
    - `ExternalLoginBinding`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `SessionCreated@1` [planned]: session created.
    - `SessionRevoked@1` [planned]: session revoked.
    - `TwoFactorEnabled@1` [planned]: two factor enabled.
    - `TwoFactorDisabled@1` [planned]: two factor disabled.
    - `ExternalLoginLinked@1` [planned]: external login linked.
    - `ExternalLoginUnlinked@1` [planned]: external login unlinked.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::AccountReference` (synchronous)
- Explicit exclusions
  - `AccountLifecycle`
  - `ScimProvisioning`
  - `OAuthAppAuthorization`

## Ubiquitous language

The catalog reserves these terms for this context:

- `Credential`
- `Session`
- `TwoFactorConfiguration`
- `ExternalLoginBinding`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `Credential`, `Session`, `TwoFactorConfiguration`, `ExternalLoginBinding`.
It excludes `AccountLifecycle`, `ScimProvisioning`, `OAuthAppAuthorization`.

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

- `SessionCreated@1` (domain, planned): session created. contract and ordering pending activation.
- `SessionRevoked@1` (domain, planned): session revoked. contract and ordering pending activation.
- `TwoFactorEnabled@1` (domain, planned): two factor enabled. contract and ordering pending activation.
- `TwoFactorDisabled@1` (domain, planned): two factor disabled. contract and ordering pending activation.
- `ExternalLoginLinked@1` (domain, planned): external login linked. contract and ordering pending activation.
- `ExternalLoginUnlinked@1` (domain, planned): external login unlinked. contract and ordering pending activation.

## Official sources

- `identity-authentication-source-01`: [authentication, sessions, two-factor authentication](https://docs.github.com/en/authentication) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
