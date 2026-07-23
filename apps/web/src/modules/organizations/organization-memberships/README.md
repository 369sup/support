# Organization Memberships Bounded Context

- **Catalog path:** `organizations/organization-memberships`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Organization membership, invitations, member roles, and membership lifecycle.

## Context content tree

- `organizations/organization-memberships` [planned]
  - Purpose: Organization membership, invitations, member roles, and membership lifecycle.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `OrganizationMembership`
    - `OrganizationInvitation`
    - `MembershipRole`
    - `MembershipState`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `OrganizationInvitationCreated@1` [planned]: organization invitation created.
    - `OrganizationInvitationAccepted@1` [planned]: organization invitation accepted.
    - `OrganizationInvitationRevoked@1` [planned]: organization invitation revoked.
    - `OrganizationMemberAdded@1` [planned]: organization member added.
    - `OrganizationMemberRemoved@1` [planned]: organization member removed.
    - `OrganizationMemberRoleChanged@1` [planned]: organization member role changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `identity/accounts::AccountReference` (synchronous)
    - `enterprises/enterprise-memberships::EnterpriseAffiliation` (synchronous)
- Explicit exclusions
  - `OutsideCollaborator`
  - `RepositoryInvitation`
  - `EnterpriseRole`

## Ubiquitous language

The catalog reserves these terms for this context:

- `OrganizationMembership`
- `OrganizationInvitation`
- `MembershipRole`
- `MembershipState`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `OrganizationMembership`, `OrganizationInvitation`, `MembershipRole`, `MembershipState`.
It excludes `OutsideCollaborator`, `RepositoryInvitation`, `EnterpriseRole`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationReference` (synchronous)
- `identity/accounts::AccountReference` (synchronous)
- `enterprises/enterprise-memberships::EnterpriseAffiliation` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `OrganizationInvitationCreated@1` (domain, planned): organization invitation created. contract and ordering pending activation.
- `OrganizationInvitationAccepted@1` (domain, planned): organization invitation accepted. contract and ordering pending activation.
- `OrganizationInvitationRevoked@1` (domain, planned): organization invitation revoked. contract and ordering pending activation.
- `OrganizationMemberAdded@1` (domain, planned): organization member added. contract and ordering pending activation.
- `OrganizationMemberRemoved@1` (domain, planned): organization member removed. contract and ordering pending activation.
- `OrganizationMemberRoleChanged@1` (domain, planned): organization member role changed. contract and ordering pending activation.

## Official sources

- `organizations-organization-memberships-source-01`: [organization membership, organization invitations, membership lifecycle](https://docs.github.com/en/organizations/managing-membership-in-your-organization) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
