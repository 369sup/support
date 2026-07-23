# Organization Roles Bounded Context

- **Catalog path:** `organizations/organization-roles`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Predefined and custom organization roles and custom repository-role definitions.

## Context content tree

- `organizations/organization-roles` [planned]
  - Purpose: Predefined and custom organization roles and custom repository-role definitions.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `OrganizationRoleDefinition`
    - `OrganizationRoleAssignment`
    - `OrganizationPermission`
    - `CustomRepositoryRoleDefinition`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `OrganizationRoleDefined@1` [planned]: organization role defined.
    - `OrganizationRoleUpdated@1` [planned]: organization role updated.
    - `OrganizationRoleDeleted@1` [planned]: organization role deleted.
    - `OrganizationRoleAssigned@1` [planned]: organization role assigned.
    - `OrganizationRoleRevoked@1` [planned]: organization role revoked.
    - `CustomRepositoryRoleDefined@1` [planned]: custom repository role defined.
    - `CustomRepositoryRoleUpdated@1` [planned]: custom repository role updated.
    - `CustomRepositoryRoleDeleted@1` [planned]: custom repository role deleted.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `organizations/organization-memberships::OrganizationMemberReference` (synchronous)
    - `organizations/organization-teams::OrganizationTeamReference` (synchronous)
- Explicit exclusions
  - `EnterpriseRole`
  - `RepositoryRoleAssignment`
  - `TeamMaintainer`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `OrganizationRoleDefinition`
- `OrganizationRoleAssignment`
- `OrganizationPermission`
- `CustomRepositoryRoleDefinition`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `OrganizationRoleDefinition`, `OrganizationRoleAssignment`, `OrganizationPermission`, `CustomRepositoryRoleDefinition`.
It excludes `EnterpriseRole`, `RepositoryRoleAssignment`, `TeamMaintainer`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationReference` (synchronous)
- `organizations/organization-memberships::OrganizationMemberReference` (synchronous)
- `organizations/organization-teams::OrganizationTeamReference` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `OrganizationRoleDefined@1` (domain, planned): organization role defined. contract and ordering pending activation.
- `OrganizationRoleUpdated@1` (domain, planned): organization role updated. contract and ordering pending activation.
- `OrganizationRoleDeleted@1` (domain, planned): organization role deleted. contract and ordering pending activation.
- `OrganizationRoleAssigned@1` (domain, planned): organization role assigned. contract and ordering pending activation.
- `OrganizationRoleRevoked@1` (domain, planned): organization role revoked. contract and ordering pending activation.
- `CustomRepositoryRoleDefined@1` (domain, planned): custom repository role defined. contract and ordering pending activation.
- `CustomRepositoryRoleUpdated@1` (domain, planned): custom repository role updated. contract and ordering pending activation.
- `CustomRepositoryRoleDeleted@1` (domain, planned): custom repository role deleted. contract and ordering pending activation.

## Official sources

- `organizations-organization-roles-source-01`: [organization roles, custom organization roles, custom repository roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
