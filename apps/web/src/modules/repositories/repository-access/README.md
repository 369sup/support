# Repository Access Bounded Context

- **Catalog path:** `repositories/repository-access`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

Repository invitations, direct and inherited grants, outside collaborators, role assignments, and source-attributed effective permission resolution.

## Context content tree

- `repositories/repository-access` [planned]
  - Purpose: Repository invitations, direct and inherited grants, outside collaborators, role assignments, and source-attributed effective permission resolution.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `RepositoryGrant`
    - `RepositoryInvitation`
    - `RepositoryInvitationState`
    - `OutsideCollaboratorGrant`
    - `TeamRepositoryGrant`
    - `RepositoryRoleAssignment`
    - `EffectiveRepositoryPermissionDecision`
  - Business rules and invariants
    - `repository-invitation-lifecycle`: Open repository collaboration invitations can have their future repository permission changed before they are accepted, declined, or revoked.
    - `repository-role-and-effective-permission`: Repository grants and role assignments contribute to source-attributed effective permissions.
    - `team-repository-access`: Organization repositories support direct and inherited team access with lifecycle effects.
    - `outside-collaborator-access`: Organization repository access can be granted to and revoked from outside collaborators.
  - Published events
    - `RepositoryInvitationCreated@1` [planned]: repository invitation created.
    - `RepositoryInvitationPermissionChanged@1` [planned]: permissions on an open repository invitation changed before acceptance.
    - `RepositoryInvitationAccepted@1` [planned]: repository invitation accepted.
    - `RepositoryInvitationDeclined@1` [planned]: repository invitation declined by the invitee.
    - `RepositoryInvitationRevoked@1` [planned]: repository invitation revoked.
    - `RepositoryAccessGranted@1` [planned]: repository access granted.
    - `RepositoryAccessChanged@1` [planned]: repository access changed.
    - `RepositoryAccessRevoked@1` [planned]: repository access revoked.
    - `TeamRepositoryAccessGranted@1` [planned]: team repository access granted.
    - `TeamRepositoryAccessRevoked@1` [planned]: team repository access revoked.
    - `OutsideCollaboratorAccessGranted@1` [planned]: outside collaborator access granted.
    - `OutsideCollaboratorAccessRevoked@1` [planned]: outside collaborator access revoked.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `repositories/repositories::RepositoryPermissionContextAndLifecycleState` (synchronous)
    - `identity/accounts::AccountReference` (synchronous)
    - `organizations/organization-memberships::OrganizationMembershipPermissionContribution` (synchronous)
    - `organizations/organization-teams::TeamRepositoryPermissionContribution` (synchronous)
    - `organizations/organization-roles::OrganizationRepositoryRoleContribution` (synchronous)
    - `organizations/organization-policies::OrganizationRepositoryPolicyContribution` (synchronous)
    - `enterprises/enterprise-teams::EnterpriseTeamPermissionContribution` (synchronous)
    - `enterprises/enterprise-roles::EnterpriseRepositoryPermissionContribution` (synchronous)
    - `repositories/repositories::RepositoryLifecycleEvents` (event; events `RepositoryTransferred@1`, `RepositoryDeleted@1`)
- Explicit exclusions
  - `OrganizationMembership`
  - `OrganizationRoleDefinition`
  - `EffectivePermissionAsSourceOfTruth`

## Ubiquitous language

The catalog reserves these terms for this context:

- `RepositoryGrant`
- `RepositoryInvitation`
- `RepositoryInvitationState`
- `OutsideCollaboratorGrant`
- `TeamRepositoryGrant`
- `RepositoryRoleAssignment`
- `EffectiveRepositoryPermissionDecision`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `RepositoryGrant`, `RepositoryInvitation`, `RepositoryInvitationState`, `OutsideCollaboratorGrant`, `TeamRepositoryGrant`, `RepositoryRoleAssignment`, `EffectiveRepositoryPermissionDecision`.
It excludes `OrganizationMembership`, `OrganizationRoleDefinition`, `EffectivePermissionAsSourceOfTruth`.

- `repository-invitation-lifecycle`: Open repository collaboration invitations can have their future repository permission changed before they are accepted, declined, or revoked.
  - Ownership: `RepositoryInvitation`, `RepositoryInvitationState`
  - Events: `RepositoryInvitationCreated@1`, `RepositoryInvitationPermissionChanged@1`, `RepositoryInvitationAccepted@1`, `RepositoryInvitationDeclined@1`, `RepositoryInvitationRevoked@1`
  - Sources: `repositories-repository-access-source-06`, `repositories-repository-access-source-07`
- `repository-role-and-effective-permission`: Repository grants and role assignments contribute to source-attributed effective permissions.
  - Ownership: `RepositoryGrant`, `RepositoryRoleAssignment`, `EffectiveRepositoryPermissionDecision`
  - Events: `RepositoryAccessGranted@1`, `RepositoryAccessChanged@1`, `RepositoryAccessRevoked@1`
  - Sources: `repositories-repository-access-source-01`, `repositories-repository-access-source-02`
- `team-repository-access`: Organization repositories support direct and inherited team access with lifecycle effects.
  - Ownership: `TeamRepositoryGrant`
  - Events: `TeamRepositoryAccessGranted@1`, `TeamRepositoryAccessRevoked@1`
  - Sources: `repositories-repository-access-source-01`, `repositories-repository-access-source-03`, `repositories-repository-access-source-04`, `repositories-repository-access-source-05`
- `outside-collaborator-access`: Organization repository access can be granted to and revoked from outside collaborators.
  - Ownership: `OutsideCollaboratorGrant`
  - Events: `OutsideCollaboratorAccessGranted@1`, `OutsideCollaboratorAccessRevoked@1`
  - Sources: `repositories-repository-access-source-01`

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `repositories/repositories::RepositoryPermissionContextAndLifecycleState` (synchronous)
- `identity/accounts::AccountReference` (synchronous)
- `organizations/organization-memberships::OrganizationMembershipPermissionContribution` (synchronous)
- `organizations/organization-teams::TeamRepositoryPermissionContribution` (synchronous)
- `organizations/organization-roles::OrganizationRepositoryRoleContribution` (synchronous)
- `organizations/organization-policies::OrganizationRepositoryPolicyContribution` (synchronous)
- `enterprises/enterprise-teams::EnterpriseTeamPermissionContribution` (synchronous)
- `enterprises/enterprise-roles::EnterpriseRepositoryPermissionContribution` (synchronous)
- `repositories/repositories::RepositoryLifecycleEvents` (event; events `RepositoryTransferred@1`, `RepositoryDeleted@1`)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `RepositoryInvitationCreated@1` (domain, planned): repository invitation created. contract and ordering pending activation.
- `RepositoryInvitationPermissionChanged@1` (domain, planned): permissions on an open repository invitation changed before acceptance. contract and ordering pending activation.
- `RepositoryInvitationAccepted@1` (domain, planned): repository invitation accepted. contract and ordering pending activation.
- `RepositoryInvitationDeclined@1` (domain, planned): repository invitation declined by the invitee. contract and ordering pending activation.
- `RepositoryInvitationRevoked@1` (domain, planned): repository invitation revoked. contract and ordering pending activation.
- `RepositoryAccessGranted@1` (domain, planned): repository access granted. contract and ordering pending activation.
- `RepositoryAccessChanged@1` (domain, planned): repository access changed. contract and ordering pending activation.
- `RepositoryAccessRevoked@1` (domain, planned): repository access revoked. contract and ordering pending activation.
- `TeamRepositoryAccessGranted@1` (domain, planned): team repository access granted. contract and ordering pending activation.
- `TeamRepositoryAccessRevoked@1` (domain, planned): team repository access revoked. contract and ordering pending activation.
- `OutsideCollaboratorAccessGranted@1` (domain, planned): outside collaborator access granted. contract and ordering pending activation.
- `OutsideCollaboratorAccessRevoked@1` (domain, planned): outside collaborator access revoked. contract and ordering pending activation.

## Official sources

- `repositories-repository-access-source-01`: [organization repository roles, base permissions, organization owner privilege](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization) (verified 2026-07-22)
- `repositories-repository-access-source-02`: [personal repository owner, personal repository collaborators](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository) (verified 2026-07-22)
- `repositories-repository-access-source-03`: [direct team access, inherited team access](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/managing-team-access-to-an-organization-repository) (verified 2026-07-22)
- `repositories-repository-access-source-04`: [permanent team permission deletion](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository) (verified 2026-07-22)
- `repositories-repository-access-source-05`: [team permissions excluded from restoration](https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository) (verified 2026-07-22)
- `repositories-repository-access-source-06`: [repository collaborator invitation creation](https://docs.github.com/en/rest/collaborators/collaborators) (verified 2026-07-22)
- `repositories-repository-access-source-07`: [open repository invitations, pending invitation permission changes, invitation acceptance, invitation decline, invitation revocation](https://docs.github.com/en/rest/collaborators/invitations) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
