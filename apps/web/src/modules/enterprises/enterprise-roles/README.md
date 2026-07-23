# Enterprise Roles Bounded Context

- **Catalog path:** `enterprises/enterprise-roles`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Predefined and custom enterprise roles, permissions, and assignments.

## Context content tree

- `enterprises/enterprise-roles` [planned]
  - Purpose: Predefined and custom enterprise roles, permissions, and assignments.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `EnterpriseRoleDefinition`
    - `EnterpriseRoleAssignment`
    - `EnterprisePermission`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `EnterpriseRoleDefined@1` [planned]: enterprise role defined.
    - `EnterpriseRoleUpdated@1` [planned]: enterprise role updated.
    - `EnterpriseRoleDeleted@1` [planned]: enterprise role deleted.
    - `EnterpriseRoleAssigned@1` [planned]: enterprise role assigned.
    - `EnterpriseRoleRevoked@1` [planned]: enterprise role revoked.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `enterprises/enterprises::EnterpriseReference` (synchronous)
    - `enterprises/enterprise-memberships::EnterpriseMemberReference` (synchronous)
    - `enterprises/enterprise-teams::EnterpriseTeamReference` (synchronous)
- Explicit exclusions
  - `OrganizationRole`
  - `RepositoryRole`
  - `BillingAccount`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `EnterpriseRoleDefinition`
- `EnterpriseRoleAssignment`
- `EnterprisePermission`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `EnterpriseRoleDefinition`, `EnterpriseRoleAssignment`, `EnterprisePermission`.
It excludes `OrganizationRole`, `RepositoryRole`, `BillingAccount`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)
- `enterprises/enterprise-memberships::EnterpriseMemberReference` (synchronous)
- `enterprises/enterprise-teams::EnterpriseTeamReference` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `EnterpriseRoleDefined@1` (domain, planned): enterprise role defined. contract and ordering pending activation.
- `EnterpriseRoleUpdated@1` (domain, planned): enterprise role updated. contract and ordering pending activation.
- `EnterpriseRoleDeleted@1` (domain, planned): enterprise role deleted. contract and ordering pending activation.
- `EnterpriseRoleAssigned@1` (domain, planned): enterprise role assigned. contract and ordering pending activation.
- `EnterpriseRoleRevoked@1` (domain, planned): enterprise role revoked. contract and ordering pending activation.

## Official sources

- `enterprises-enterprise-roles-source-01`: [enterprise roles, custom enterprise roles, enterprise permissions](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
