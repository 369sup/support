# Repository Access Bounded Context

- **Catalog path:** `repositories/repository-access`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `validated`

## Purpose

Repository invitations, direct and inherited grants, outside collaborators, role assignments, and source-attributed effective permission resolution.

## Context content tree

- `repositories/repository-access` [active]
  - Purpose: Repository invitations, direct and inherited grants, outside collaborators, role assignments, and source-attributed effective permission resolution.
  - Capabilities
    - `grant-team-repository-access` [active]
    - `change-team-repository-access` [active]
    - `revoke-team-repository-access` [active]
    - `resolve-effective-repository-permission` [active]
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
    - `TeamRepositoryAccessGranted@1` [active]: team repository access granted or changed.
    - `TeamRepositoryAccessRevoked@1` [active]: team repository access revoked.
    - `OutsideCollaboratorAccessGranted@1` [planned]: outside collaborator access granted.
    - `OutsideCollaboratorAccessRevoked@1` [planned]: outside collaborator access revoked.
- External relationships
  - Runtime dependencies:
    - `repositories/repositories::RepositoryCandidateReference`
    - `identity/accounts::AccountReference`
    - `organizations/organization-memberships::OrganizationMembershipReference`
    - `organizations/organization-teams::EffectiveTeamMembershipReference`
    - `organizations/organization-roles::OrganizationRepositoryRoleContribution`
    - `platform/event-publication::EventRecorderPort`
  - Planned relationships
    - `organizations/organization-policies::OrganizationRepositoryPolicyContribution` (synchronous)
    - `enterprises/enterprise-teams::EnterpriseTeamPermissionContribution` (synchronous)
    - `enterprises/enterprise-roles::EnterpriseRepositoryPermissionContribution` (synchronous)
    - `repositories/repositories::RepositoryLifecycleEvents` (event; events `RepositoryTransferred@1`, `RepositoryDeleted@1`)
- Explicit exclusions
  - `OrganizationMembership`
  - `OrganizationRoleDefinition`
  - `EffectivePermissionAsSourceOfTruth`

## Designed use cases

### `resolve-effective-repository-permission` [active]

- **Type:** `query`
- **Application boundary:** `ResolveEffectiveRepositoryPermissionUseCase.resolveEffectiveRepositoryPermission()`
- **Public entrypoint:** `server-api.ts#resolveEffectiveRepositoryPermission`
- **Input:** Active repository candidate and authenticated account reference.
- **Success result:** Source-attributed effective permission decision.
- **Expected rejections:** `none`
- **Authorization:** This context owns the repository visibility and permission decision.
- **Transaction:** Read-only aggregation.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repositories::RepositoryCandidateReference`, `identity/accounts::AccountReference`, `organizations/organization-memberships::OrganizationMembershipReference`, `organizations/organization-teams::EffectiveTeamMembershipReference`, `organizations/organization-roles::OrganizationRepositoryRoleContribution`
- **Published events:** `none`
- **Official evidence:** `repositories-repository-access-source-01`
- **Local policy:** Active sources are public read, personal owner, organization owner, direct grant, direct or inherited team grant, and predefined organization role; general membership is not a base permission.

### `grant-team-repository-access` [active]

- **Type:** `command`
- **Application boundary:** `GrantTeamRepositoryAccessUseCase.grantTeamRepositoryAccess()`
- **Public entrypoint:** `server-api.ts#grantTeamRepositoryAccess`
- **Input:** Active organization-owned repository candidate, authenticated actor, team ID, and repository permission.
- **Success result:** Active `TeamRepositoryGrantReference`.
- **Expected rejections:** `permission-denied`, `repository-not-organization-owned`, `team-not-eligible`, `team-grant-conflict`
- **Authorization:** Effective repository admin permission and visible active team in the repository organization.
- **Transaction:** One repository-access team-grant transaction.
- **Idempotency:** Duplicate active repository/team grant is rejected.
- **Dependencies:** `repositories/repositories::RepositoryCandidateReference`, `identity/accounts::AccountReference`, `organizations/organization-teams::EffectiveTeamMembershipReference`, `organizations/organization-roles::OrganizationRepositoryRoleContribution`, `platform/event-publication::EventRecorderPort`
- **Published events:** `TeamRepositoryAccessGranted@1`
- **Official evidence:** `repositories-repository-access-source-03`
- **Local policy:** Context selection never grants access.

### `change-team-repository-access` [active]

- **Type:** `command`
- **Application boundary:** `ChangeTeamRepositoryAccessUseCase.changeTeamRepositoryAccess()`
- **Public entrypoint:** `server-api.ts#changeTeamRepositoryAccess`
- **Input:** Active organization-owned repository candidate, authenticated actor, directly granted team ID, and new permission.
- **Success result:** Updated `TeamRepositoryGrantReference`.
- **Expected rejections:** `permission-denied`, `repository-not-organization-owned`, `team-not-eligible`, `team-grant-not-found`
- **Authorization:** Effective repository admin permission.
- **Transaction:** One repository-access team-grant transaction.
- **Idempotency:** Reapplying the same permission is a no-op update.
- **Dependencies:** `repositories/repositories::RepositoryCandidateReference`, `identity/accounts::AccountReference`, `organizations/organization-teams::EffectiveTeamMembershipReference`, `organizations/organization-roles::OrganizationRepositoryRoleContribution`, `platform/event-publication::EventRecorderPort`
- **Published events:** `TeamRepositoryAccessGranted@1`
- **Official evidence:** `repositories-repository-access-source-03`
- **Local policy:** Inherited grants can only be changed at the granting ancestor team.

### `revoke-team-repository-access` [active]

- **Type:** `command`
- **Application boundary:** `RevokeTeamRepositoryAccessUseCase.revokeTeamRepositoryAccess()`
- **Public entrypoint:** `server-api.ts#revokeTeamRepositoryAccess`
- **Input:** Active organization-owned repository candidate, authenticated actor, and team ID.
- **Success result:** Revoked `TeamRepositoryGrantReference`.
- **Expected rejections:** `permission-denied`, `repository-not-organization-owned`, `team-not-eligible`, `team-grant-not-found`, `inherited-access-cannot-be-removed`
- **Authorization:** Effective repository admin or maintainer of the directly granted target team.
- **Transaction:** One repository-access team-grant transaction.
- **Idempotency:** Missing or revoked direct grants are rejected.
- **Dependencies:** `repositories/repositories::RepositoryCandidateReference`, `identity/accounts::AccountReference`, `organizations/organization-teams::EffectiveTeamMembershipReference`, `organizations/organization-roles::OrganizationRepositoryRoleContribution`, `platform/event-publication::EventRecorderPort`
- **Published events:** `TeamRepositoryAccessRevoked@1`
- **Official evidence:** `repositories-repository-access-source-03`
- **Local policy:** A child cannot revoke access inherited from an ancestor.

## Ubiquitous language

The catalog reserves these terms for this context:

- `RepositoryGrant`
- `RepositoryInvitation`
- `RepositoryInvitationState`
- `OutsideCollaboratorGrant`
- `TeamRepositoryGrant`
- `RepositoryRoleAssignment`
- `EffectiveRepositoryPermissionDecision`

The active decision aggregates explicit sources and chooses the strongest
permission.

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

`resolveEffectiveRepositoryPermission` is exposed through `server-api.ts`.
`EffectiveRepositoryPermissionDecision` is the integration contract.
Team grant, change, and revoke commands are exposed through `server-api.ts`.

## Dependencies and consistency

### Runtime dependencies

- `repositories/repositories::RepositoryCandidateReference`
- `identity/accounts::AccountReference`
- `organizations/organization-memberships::OrganizationMembershipReference`
- `organizations/organization-teams::EffectiveTeamMembershipReference`
- `organizations/organization-roles::OrganizationRepositoryRoleContribution`
- `platform/event-publication::EventRecorderPort`

### Planned relationships

- `repositories/repositories::RepositoryPermissionContextAndLifecycleState` (synchronous)
- `identity/accounts::AccountReference` (synchronous)
- `organizations/organization-memberships::OrganizationMembershipPermissionContribution` (synchronous)
- `organizations/organization-policies::OrganizationRepositoryPolicyContribution` (synchronous)
- `enterprises/enterprise-teams::EnterpriseTeamPermissionContribution` (synchronous)
- `enterprises/enterprise-roles::EnterpriseRepositoryPermissionContribution` (synchronous)
- `repositories/repositories::RepositoryLifecycleEvents` (event; events `RepositoryTransferred@1`, `RepositoryDeleted@1`)

## Authorization

The decision denies when no source contributes permission. Dashboard context is
never treated as a grant. Team grant creation and change require effective
repository admin. A team maintainer may revoke only the team's direct grant.

## Persistence and transactions

Direct and team grants are context-local versioned in-memory records.
Permission aggregation is read-only and does not create a cross-context
transaction.

## Data classification

Repository grants and permission sources are authorization-sensitive data.

## Retention and erasure

Fixtures live for the process lifetime. Durable grant lifecycle remains
planned.

## Events and failure behavior

- `RepositoryInvitationCreated@1` (domain, planned): repository invitation created. contract and ordering pending activation.
- `RepositoryInvitationPermissionChanged@1` (domain, planned): permissions on an open repository invitation changed before acceptance. contract and ordering pending activation.
- `RepositoryInvitationAccepted@1` (domain, planned): repository invitation accepted. contract and ordering pending activation.
- `RepositoryInvitationDeclined@1` (domain, planned): repository invitation declined by the invitee. contract and ordering pending activation.
- `RepositoryInvitationRevoked@1` (domain, planned): repository invitation revoked. contract and ordering pending activation.
- `RepositoryAccessGranted@1` (domain, planned): repository access granted. contract and ordering pending activation.
- `RepositoryAccessChanged@1` (domain, planned): repository access changed. contract and ordering pending activation.
- `RepositoryAccessRevoked@1` (domain, planned): repository access revoked. contract and ordering pending activation.
- `TeamRepositoryAccessGranted@1` (domain, active): team repository access granted or changed; schema `integration-contracts.ts#TeamRepositoryAccessGrantedV1`, ordered by `grantId`.
- `TeamRepositoryAccessRevoked@1` (domain, active): team repository access revoked; schema `integration-contracts.ts#TeamRepositoryAccessRevokedV1`, ordered by `grantId`.
- `OutsideCollaboratorAccessGranted@1` (domain, planned): outside collaborator access granted. contract and ordering pending activation.
- `OutsideCollaboratorAccessRevoked@1` (domain, planned): outside collaborator access revoked. contract and ordering pending activation.

The permission query emits no events. Successful team grant commands record
their active events in the context-owned outbox; publication failure does not
roll back the committed grant. Expected query denial is returned as
`allowed: false`; unexpected dependency failures propagate.

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
