# Organization Policies Bounded Context

- **Catalog path:** `organizations/organization-policies`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Organization policies for repositories, collaborators, projects, discussions, and member privileges.

## Context content tree

- `organizations/organization-policies` [planned]
  - Purpose: Organization policies for repositories, collaborators, projects, discussions, and member privileges.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `RepositoryCreationPolicy`
    - `RepositoryVisibilityPolicy`
    - `OutsideCollaboratorPolicy`
    - `ProjectPolicy`
    - `DiscussionPolicy`
    - `BaseRepositoryPermission`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `OrganizationPolicyChanged@1` [planned]: organization policy changed.
    - `BaseRepositoryPermissionChanged@1` [planned]: base repository permission changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `enterprises/enterprise-policies::EnterprisePolicyConstraints` (synchronous)
- Explicit exclusions
  - `EnterprisePolicy`
  - `RepositoryGrant`
  - `CodeRuleset`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `RepositoryCreationPolicy`
- `RepositoryVisibilityPolicy`
- `OutsideCollaboratorPolicy`
- `ProjectPolicy`
- `DiscussionPolicy`
- `BaseRepositoryPermission`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `RepositoryCreationPolicy`, `RepositoryVisibilityPolicy`, `OutsideCollaboratorPolicy`, `ProjectPolicy`, `DiscussionPolicy`, `BaseRepositoryPermission`.
It excludes `EnterprisePolicy`, `RepositoryGrant`, `CodeRuleset`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationReference` (synchronous)
- `enterprises/enterprise-policies::EnterprisePolicyConstraints` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `OrganizationPolicyChanged@1` (domain, planned): organization policy changed. contract and ordering pending activation.
- `BaseRepositoryPermissionChanged@1` (domain, planned): base repository permission changed. contract and ordering pending activation.

## Official sources

- `organizations-organization-policies-source-01`: [organization settings, member privileges, repository policies](https://docs.github.com/en/organizations/managing-organization-settings) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
