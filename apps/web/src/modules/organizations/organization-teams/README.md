# Organization Teams Bounded Context

- **Catalog path:** `organizations/organization-teams`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `validated`

## Purpose

Own organization team identity, direct membership, maintainers, visibility, and
an acyclic same-organization parent hierarchy.

## Context content tree

- Organization teams [active]
  - `create-organization-team`
  - `get-organization-team`
  - `list-organization-teams`
  - `update-organization-team`
  - `delete-organization-team`
  - `add-team-member`
  - `remove-team-member`
  - `assign-team-maintainer`
  - `revoke-team-maintainer`
  - `list-team-members`
  - `resolve-account-team-memberships`
  - Team hierarchy: one optional parent in the same organization.
  - Permission projection: direct memberships plus ancestor team IDs for
    repository-grant resolution.
- Owned concepts
  - `OrganizationTeam`
  - `TeamMembership`
  - `TeamMaintainer`
  - `ParentTeamReference`
  - `TeamVisibility`
- Explicit exclusions
  - `EnterpriseTeam`
  - `OutsideCollaborator`
  - `RepositoryRole`
- Published events
  - `OrganizationTeamCreated@1` [planned]
  - `OrganizationTeamUpdated@1` [planned]
  - `OrganizationTeamDeleted@1` [planned]
  - `TeamMemberAdded@1` [planned]
  - `TeamMemberRemoved@1` [planned]
  - `TeamMaintainerChanged@1` [planned]
  - `ParentTeamChanged@1` [planned]
  - `TeamVisibilityChanged@1` [planned]

## Designed use cases

### `create-organization-team` [active]

- **Type:** `command`
- **Application boundary:** `CreateOrganizationTeamUseCase.createOrganizationTeam()`
- **Public entrypoint:** `server-api.ts#createOrganizationTeam`
- **Input:** Actor account ID, organization ID, name, slug, description, visibility, and optional parent team ID.
- **Success result:** Created `OrganizationTeamReference`.
- **Expected rejections:** `organization-not-found`, `membership-inactive`, `permission-denied`, `team-slug-conflict`, `parent-team-invalid`, `secret-team-cannot-be-nested`
- **Authorization:** Active organization owner for the target organization.
- **Transaction:** One organization-team store transaction.
- **Idempotency:** Duplicate organization slug is rejected.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Team creation is owner-only until organization team-creation policy is active.

### `get-organization-team` [active]

- **Type:** `query`
- **Application boundary:** `GetOrganizationTeamUseCase.getOrganizationTeam()`
- **Public entrypoint:** `server-api.ts#getOrganizationTeam`
- **Input:** Actor account ID, organization ID, and team slug.
- **Success result:** Visible `OrganizationTeamReference`.
- **Expected rejections:** `team-not-found`
- **Authorization:** Visible teams require active organization membership; secret teams additionally require organization ownership or direct team membership.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Unauthorized secret-team lookup is indistinguishable from absence.

### `list-organization-teams` [active]

- **Type:** `query`
- **Application boundary:** `ListOrganizationTeamsUseCase.listOrganizationTeams()`
- **Public entrypoint:** `server-api.ts#listOrganizationTeams`
- **Input:** Actor account ID and organization ID.
- **Success result:** Visible active organization teams.
- **Expected rejections:** `membership-inactive`
- **Authorization:** Active organization membership; secret teams are filtered unless the actor is an owner or direct team member.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Deleted teams are excluded.

### `update-organization-team` [active]

- **Type:** `command`
- **Application boundary:** `UpdateOrganizationTeamUseCase.updateOrganizationTeam()`
- **Public entrypoint:** `server-api.ts#updateOrganizationTeam`
- **Input:** Actor account ID, team ID, and optional profile, visibility, or parent changes.
- **Success result:** Updated `OrganizationTeamReference`.
- **Expected rejections:** `team-not-found`, `permission-denied`, `team-slug-conflict`, `parent-team-invalid`, `team-hierarchy-cycle`, `secret-team-cannot-be-nested`
- **Authorization:** Organization owner for hierarchy changes; organization owner or target-team maintainer for profile and visibility changes.
- **Transaction:** One organization-team store transaction.
- **Idempotency:** Reapplying the same values is a no-op.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Secret teams cannot have a parent or children.

### `delete-organization-team` [active]

- **Type:** `command`
- **Application boundary:** `DeleteOrganizationTeamUseCase.deleteOrganizationTeam()`
- **Public entrypoint:** `server-api.ts#deleteOrganizationTeam`
- **Input:** Actor account ID and team ID.
- **Success result:** Deleted team reference.
- **Expected rejections:** `team-not-found`, `permission-denied`
- **Authorization:** Active organization owner.
- **Transaction:** Soft delete in one organization-team store transaction.
- **Idempotency:** Already deleted teams are returned as not found.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Cross-context grants and assignments remain stored but stop contributing.

### `add-team-member` [active]

- **Type:** `command`
- **Application boundary:** `AddTeamMemberUseCase.addTeamMember()`
- **Public entrypoint:** `server-api.ts#addTeamMember`
- **Input:** Actor account ID, team ID, and target account ID.
- **Success result:** Active `TeamMembershipReference`.
- **Expected rejections:** `team-not-found`, `membership-inactive`, `permission-denied`, `already-team-member`
- **Authorization:** Organization owner or target-team maintainer.
- **Transaction:** One team-membership transaction.
- **Idempotency:** Duplicate active membership is rejected.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Invitations and outside collaborators are not created by this command.

### `remove-team-member` [active]

- **Type:** `command`
- **Application boundary:** `RemoveTeamMemberUseCase.removeTeamMember()`
- **Public entrypoint:** `server-api.ts#removeTeamMember`
- **Input:** Actor account ID, team ID, and target account ID.
- **Success result:** Removed `TeamMembershipReference`.
- **Expected rejections:** `team-not-found`, `team-member-not-found`, `permission-denied`
- **Authorization:** Organization owner or target-team maintainer.
- **Transaction:** Membership removal and maintainer removal are atomic in the team store.
- **Idempotency:** Missing active membership is rejected.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Removing a member also removes its maintainer designation.

### `assign-team-maintainer` [active]

- **Type:** `command`
- **Application boundary:** `AssignTeamMaintainerUseCase.assignTeamMaintainer()`
- **Public entrypoint:** `server-api.ts#assignTeamMaintainer`
- **Input:** Actor account ID, team ID, and target account ID.
- **Success result:** Active `TeamMaintainerReference`.
- **Expected rejections:** `team-not-found`, `team-member-not-found`, `permission-denied`, `already-team-maintainer`
- **Authorization:** Active organization owner.
- **Transaction:** One team-maintainer transaction.
- **Idempotency:** Duplicate designation is rejected.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** The target must already be a direct active team member.

### `revoke-team-maintainer` [active]

- **Type:** `command`
- **Application boundary:** `RevokeTeamMaintainerUseCase.revokeTeamMaintainer()`
- **Public entrypoint:** `server-api.ts#revokeTeamMaintainer`
- **Input:** Actor account ID, team ID, and target account ID.
- **Success result:** Revoked `TeamMaintainerReference`.
- **Expected rejections:** `team-not-found`, `team-maintainer-not-found`, `permission-denied`
- **Authorization:** Active organization owner.
- **Transaction:** One team-maintainer transaction.
- **Idempotency:** Missing active designation is rejected.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Revocation does not remove team membership.

### `list-team-members` [active]

- **Type:** `query`
- **Application boundary:** `ListTeamMembersUseCase.listTeamMembers()`
- **Public entrypoint:** `server-api.ts#listTeamMembers`
- **Input:** Actor account ID and team ID.
- **Success result:** Active direct memberships with maintainer flags.
- **Expected rejections:** `team-not-found`
- **Authorization:** Same visibility decision as team lookup.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Parent or child membership is never flattened into this direct-member list.

### `resolve-account-team-memberships` [active]

- **Type:** `query`
- **Application boundary:** `ResolveAccountTeamMembershipsUseCase.resolveAccountTeamMemberships()`
- **Public entrypoint:** `server-api.ts#resolveAccountTeamMemberships`
- **Input:** Account ID and organization ID.
- **Success result:** Direct active team memberships and ancestor team IDs used for repository grants.
- **Expected rejections:** `none`
- **Authorization:** Internal authorization integration contract.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-teams-source-01`
- **Local policy:** Ancestors contribute repository grants but do not become direct memberships.

## Ubiquitous language

- **Direct team membership:** Explicit association between one active
  organization member and one team.
- **Team maintainer:** Direct member designated to administer one team.
- **Ancestor team:** Parent reached through the acyclic hierarchy; it may
  contribute repository access but not membership.
- **Secret team:** Team visible only to organization owners and its direct
  members; it cannot be nested.

## Ownership and invariants

This context owns team identity, direct membership, maintainers, visibility, and
hierarchy. Team slugs are unique within an organization. A maintainer must be a
direct active member. Hierarchy edges stay within one organization and remain
acyclic. Secret teams cannot have a parent or children.

## Public capabilities

The server API exposes the approved team commands and queries. Integration
contracts expose team references and effective membership ancestry without
exposing persistence.

## Dependencies and consistency

Active synchronous dependencies are
`organizations/organizations::OrganizationReference` and
`organizations/organization-memberships::OrganizationMembershipReference`.
No other context may read the team store.

## Authorization

Organization ownership is resolved by the membership context. Team maintainer
authority is local to the target team. Secret-team denials use not-found
semantics.

## Persistence and transactions

The adapter uses a versioned process-local store with indexes by ID,
organization and slug, parent, account, and maintainer. Each command writes only
the organization-team store.

## Data classification

Team membership and secret-team metadata are authorization-sensitive
organization data and must not be logged in full.

## Retention and erasure

Teams are soft deleted for the process lifetime. Deleted teams, removed
memberships, and revoked maintainers do not contribute authorization.

## Events and failure behavior

Catalog events remain planned. Active commands initially return explicit
results and do not publish events until the event-publication capability is
active. Dependency failures propagate without partial cross-context writes.

## Official sources

- `organizations-organization-teams-source-01`: [organization teams, nesting,
  visibility, and maintainers](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams)
  (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog.
