# Organization Teams Bounded Context

- **Catalog path:** `organizations/organization-teams`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Organization teams, nested hierarchy, visibility, membership, maintainers, and mentions.

## Context content tree

- `organizations/organization-teams` [planned]
  - Purpose: Organization teams, nested hierarchy, visibility, membership, maintainers, and mentions.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `OrganizationTeam`
    - `TeamMembership`
    - `TeamMaintainer`
    - `ParentTeamReference`
    - `TeamVisibility`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `OrganizationTeamCreated@1` [planned]: organization team created.
    - `OrganizationTeamUpdated@1` [planned]: organization team updated.
    - `OrganizationTeamDeleted@1` [planned]: organization team deleted.
    - `TeamMemberAdded@1` [planned]: team member added.
    - `TeamMemberRemoved@1` [planned]: team member removed.
    - `TeamMaintainerChanged@1` [planned]: team maintainer changed.
    - `ParentTeamChanged@1` [planned]: parent team changed.
    - `TeamVisibilityChanged@1` [planned]: team visibility changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `organizations/organization-memberships::OrganizationMemberReference` (synchronous)
- Explicit exclusions
  - `EnterpriseTeam`
  - `OutsideCollaborator`
  - `RepositoryRole`

## Ubiquitous language

The catalog reserves these terms for this context:

- `OrganizationTeam`
- `TeamMembership`
- `TeamMaintainer`
- `ParentTeamReference`
- `TeamVisibility`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `OrganizationTeam`, `TeamMembership`, `TeamMaintainer`, `ParentTeamReference`, `TeamVisibility`.
It excludes `EnterpriseTeam`, `OutsideCollaborator`, `RepositoryRole`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationReference` (synchronous)
- `organizations/organization-memberships::OrganizationMemberReference` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `OrganizationTeamCreated@1` (domain, planned): organization team created. contract and ordering pending activation.
- `OrganizationTeamUpdated@1` (domain, planned): organization team updated. contract and ordering pending activation.
- `OrganizationTeamDeleted@1` (domain, planned): organization team deleted. contract and ordering pending activation.
- `TeamMemberAdded@1` (domain, planned): team member added. contract and ordering pending activation.
- `TeamMemberRemoved@1` (domain, planned): team member removed. contract and ordering pending activation.
- `TeamMaintainerChanged@1` (domain, planned): team maintainer changed. contract and ordering pending activation.
- `ParentTeamChanged@1` (domain, planned): parent team changed. contract and ordering pending activation.
- `TeamVisibilityChanged@1` (domain, planned): team visibility changed. contract and ordering pending activation.

## Official sources

- `organizations-organization-teams-source-01`: [organization teams, nested teams, team visibility, team maintainers](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
