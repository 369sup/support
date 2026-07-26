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

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `EnterpriseTeam`, `EnterpriseTeamMembership`, `EnterpriseTeamOrganizationGrant`.
It excludes `OrganizationTeam`, `RepositoryGrant`, `CostCenter`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)
- `enterprises/enterprise-memberships::EnterpriseMemberReference` (synchronous)

## Official sources

- `enterprises-enterprise-teams-source-01`: [enterprise teams, enterprise team membership](https://docs.github.com/en/enterprise-cloud@latest/admin/concepts/enterprise-fundamentals/teams-in-an-enterprise) (verified 2026-07-23; preview)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
