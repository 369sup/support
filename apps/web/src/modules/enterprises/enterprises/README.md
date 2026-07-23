# Enterprises Bounded Context

- **Catalog path:** `enterprises/enterprises`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Enterprise identity, profile, account mode, lifecycle, and organization ownership.

## Context content tree

- `enterprises/enterprises` [planned]
  - Purpose: Enterprise identity, profile, account mode, lifecycle, and organization ownership.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `Enterprise`
    - `EnterpriseType`
    - `EnterpriseLifecycle`
    - `EnterpriseOrganizationLink`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `EnterpriseCreated@1` [planned]: enterprise created.
    - `EnterpriseProfileUpdated@1` [planned]: enterprise profile updated.
    - `EnterpriseOrganizationLinked@1` [planned]: enterprise organization linked.
    - `EnterpriseOrganizationUnlinked@1` [planned]: enterprise organization unlinked.
    - `EnterpriseLifecycleChanged@1` [planned]: enterprise lifecycle changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::ActorReference` (synchronous)
- Explicit exclusions
  - `EnterpriseMembership`
  - `EnterpriseRole`
  - `EnterprisePolicy`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `Enterprise`
- `EnterpriseType`
- `EnterpriseLifecycle`
- `EnterpriseOrganizationLink`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `Enterprise`, `EnterpriseType`, `EnterpriseLifecycle`, `EnterpriseOrganizationLink`.
It excludes `EnterpriseMembership`, `EnterpriseRole`, `EnterprisePolicy`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::ActorReference` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `EnterpriseCreated@1` (domain, planned): enterprise created. contract and ordering pending activation.
- `EnterpriseProfileUpdated@1` (domain, planned): enterprise profile updated. contract and ordering pending activation.
- `EnterpriseOrganizationLinked@1` (domain, planned): enterprise organization linked. contract and ordering pending activation.
- `EnterpriseOrganizationUnlinked@1` (domain, planned): enterprise organization unlinked. contract and ordering pending activation.
- `EnterpriseLifecycleChanged@1` (domain, planned): enterprise lifecycle changed. contract and ordering pending activation.

## Official sources

- `enterprises-enterprises-source-01`: [enterprise accounts, enterprise organizations, enterprise repositories](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
