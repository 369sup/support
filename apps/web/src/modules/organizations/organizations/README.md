# Organizations Bounded Context

- **Catalog path:** `organizations/organizations`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Organization identity, profile, lifecycle, verified domains, and enterprise ownership.

## Context content tree

- `organizations/organizations` [planned]
  - Purpose: Organization identity, profile, lifecycle, verified domains, and enterprise ownership.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `Organization`
    - `OrganizationProfile`
    - `OrganizationLifecycle`
    - `VerifiedDomain`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `OrganizationCreated@1` [planned]: organization created.
    - `OrganizationProfileUpdated@1` [planned]: organization profile updated.
    - `OrganizationRenamed@1` [planned]: organization renamed.
    - `OrganizationLifecycleChanged@1` [planned]: organization lifecycle changed.
    - `VerifiedDomainAdded@1` [planned]: verified domain added.
    - `VerifiedDomainRemoved@1` [planned]: verified domain removed.
    - `EnterpriseOwnershipChanged@1` [planned]: enterprise ownership changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `enterprises/enterprises::EnterpriseReference` (synchronous)
- Explicit exclusions
  - `OrganizationMembership`
  - `OrganizationTeam`
  - `Repository`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `Organization`
- `OrganizationProfile`
- `OrganizationLifecycle`
- `VerifiedDomain`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `Organization`, `OrganizationProfile`, `OrganizationLifecycle`, `VerifiedDomain`.
It excludes `OrganizationMembership`, `OrganizationTeam`, `Repository`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `OrganizationCreated@1` (domain, planned): organization created. contract and ordering pending activation.
- `OrganizationProfileUpdated@1` (domain, planned): organization profile updated. contract and ordering pending activation.
- `OrganizationRenamed@1` (domain, planned): organization renamed. contract and ordering pending activation.
- `OrganizationLifecycleChanged@1` (domain, planned): organization lifecycle changed. contract and ordering pending activation.
- `VerifiedDomainAdded@1` (domain, planned): verified domain added. contract and ordering pending activation.
- `VerifiedDomainRemoved@1` (domain, planned): verified domain removed. contract and ordering pending activation.
- `EnterpriseOwnershipChanged@1` (domain, planned): enterprise ownership changed. contract and ordering pending activation.

## Official sources

- `organizations-organizations-source-01`: [organizations, organization ownership, organization profile](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
