# Enterprise Teams Bounded Context

- **Catalog path:** `enterprises/enterprise-teams`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `preview`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Enterprise-wide teams used for centralized role, organization, and license assignment.

## Context content tree

- `enterprises/enterprise-teams` [planned]
  - Purpose: Enterprise-wide teams used for centralized role, organization, and license assignment.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `EnterpriseTeam`
    - `EnterpriseTeamMembership`
    - `EnterpriseTeamOrganizationGrant`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `EnterpriseTeamCreated@1` [planned]: enterprise team created.
    - `EnterpriseTeamUpdated@1` [planned]: enterprise team updated.
    - `EnterpriseTeamDeleted@1` [planned]: enterprise team deleted.
    - `EnterpriseTeamMemberAdded@1` [planned]: enterprise team member added.
    - `EnterpriseTeamMemberRemoved@1` [planned]: enterprise team member removed.
    - `EnterpriseTeamOrganizationGranted@1` [planned]: enterprise team organization granted.
    - `EnterpriseTeamOrganizationRevoked@1` [planned]: enterprise team organization revoked.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `enterprises/enterprises::EnterpriseReference` (synchronous)
    - `enterprises/enterprise-memberships::EnterpriseMemberReference` (synchronous)
- Explicit exclusions
  - `OrganizationTeam`
  - `RepositoryGrant`
  - `CostCenter`

## Ubiquitous language

The catalog reserves these terms for this context:

- `EnterpriseTeam`
- `EnterpriseTeamMembership`
- `EnterpriseTeamOrganizationGrant`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `EnterpriseTeam`, `EnterpriseTeamMembership`, `EnterpriseTeamOrganizationGrant`.
It excludes `OrganizationTeam`, `RepositoryGrant`, `CostCenter`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)
- `enterprises/enterprise-memberships::EnterpriseMemberReference` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `EnterpriseTeamCreated@1` (domain, planned): enterprise team created. contract and ordering pending activation.
- `EnterpriseTeamUpdated@1` (domain, planned): enterprise team updated. contract and ordering pending activation.
- `EnterpriseTeamDeleted@1` (domain, planned): enterprise team deleted. contract and ordering pending activation.
- `EnterpriseTeamMemberAdded@1` (domain, planned): enterprise team member added. contract and ordering pending activation.
- `EnterpriseTeamMemberRemoved@1` (domain, planned): enterprise team member removed. contract and ordering pending activation.
- `EnterpriseTeamOrganizationGranted@1` (domain, planned): enterprise team organization granted. contract and ordering pending activation.
- `EnterpriseTeamOrganizationRevoked@1` (domain, planned): enterprise team organization revoked. contract and ordering pending activation.

## Official sources

- `enterprises-enterprise-teams-source-01`: [enterprise teams, enterprise team membership](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
