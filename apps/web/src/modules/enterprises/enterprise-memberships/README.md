# Enterprise Memberships Bounded Context

- **Catalog path:** `enterprises/enterprise-memberships`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Enterprise membership, invitations, affiliation, guest collaborators, and unaffiliated users.

## Context content tree

- `enterprises/enterprise-memberships` [planned]
  - Purpose: Enterprise membership, invitations, affiliation, guest collaborators, and unaffiliated users.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `EnterpriseMembership`
    - `EnterpriseInvitation`
    - `EnterpriseAffiliation`
    - `GuestCollaboratorStatus`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `EnterpriseInvitationCreated@1` [planned]: enterprise invitation created.
    - `EnterpriseInvitationAccepted@1` [planned]: enterprise invitation accepted.
    - `EnterpriseInvitationRevoked@1` [planned]: enterprise invitation revoked.
    - `EnterpriseMemberAdded@1` [planned]: enterprise member added.
    - `EnterpriseMemberRemoved@1` [planned]: enterprise member removed.
    - `EnterpriseAffiliationChanged@1` [planned]: enterprise affiliation changed.
    - `GuestCollaboratorStatusChanged@1` [planned]: guest collaborator status changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `enterprises/enterprises::EnterpriseReference` (synchronous)
    - `identity/accounts::AccountReference` (synchronous)
- Explicit exclusions
  - `OrganizationMembership`
  - `RepositoryGrant`
  - `License`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `EnterpriseMembership`
- `EnterpriseInvitation`
- `EnterpriseAffiliation`
- `GuestCollaboratorStatus`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `EnterpriseMembership`, `EnterpriseInvitation`, `EnterpriseAffiliation`, `GuestCollaboratorStatus`.
It excludes `OrganizationMembership`, `RepositoryGrant`, `License`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)
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

- `EnterpriseInvitationCreated@1` (domain, planned): enterprise invitation created. contract and ordering pending activation.
- `EnterpriseInvitationAccepted@1` (domain, planned): enterprise invitation accepted. contract and ordering pending activation.
- `EnterpriseInvitationRevoked@1` (domain, planned): enterprise invitation revoked. contract and ordering pending activation.
- `EnterpriseMemberAdded@1` (domain, planned): enterprise member added. contract and ordering pending activation.
- `EnterpriseMemberRemoved@1` (domain, planned): enterprise member removed. contract and ordering pending activation.
- `EnterpriseAffiliationChanged@1` (domain, planned): enterprise affiliation changed. contract and ordering pending activation.
- `GuestCollaboratorStatusChanged@1` (domain, planned): guest collaborator status changed. contract and ordering pending activation.

## Official sources

- `enterprises-enterprise-memberships-source-01`: [enterprise members, unaffiliated users, guest collaborators](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-people-in-your-enterprise) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
