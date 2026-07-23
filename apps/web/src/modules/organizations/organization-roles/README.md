# Organization Roles Bounded Context

- **Catalog path:** `organizations/organization-roles`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

Own immutable predefined organization-role definitions, assignments to active
organization members or teams, and source-attributed organization-wide
repository permission contributions.

## Context content tree

- Predefined organization roles [planned]
  - Immutable role catalog.
  - Account and team assignments.
  - Multiple roles per subject.
  - Repository permission contributions from security-manager and
    all-repository roles.
- Custom organization and repository roles [planned]
  - Deferred until entitlements and fine-grained permission definitions are
    active.
- Owned concepts
  - `OrganizationRoleDefinition`
  - `OrganizationRoleAssignment`
  - `OrganizationPermission`
  - `CustomRepositoryRoleDefinition` [planned]
- Explicit exclusions
  - `EnterpriseRole`
  - `RepositoryRoleAssignment`
  - `TeamMaintainer`
- Published events
  - `OrganizationRoleDefined@1` [planned]
  - `OrganizationRoleUpdated@1` [planned]
  - `OrganizationRoleDeleted@1` [planned]
  - `OrganizationRoleAssigned@1` [planned]
  - `OrganizationRoleRevoked@1` [planned]
  - `CustomRepositoryRoleDefined@1` [planned]
  - `CustomRepositoryRoleUpdated@1` [planned]
  - `CustomRepositoryRoleDeleted@1` [planned]

## Designed use cases

### `list-predefined-organization-roles` [planned]

- **Type:** `query`
- **Application boundary:** `ListPredefinedOrganizationRolesUseCase.listPredefinedOrganizationRoles()`
- **Public entrypoint:** `server-api.ts#listPredefinedOrganizationRoles`
- **Input:** Actor account ID and organization ID.
- **Success result:** Immutable predefined role definitions.
- **Expected rejections:** `membership-inactive`
- **Authorization:** Active organization membership.
- **Transaction:** Read-only static catalog.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-roles-source-03`
- **Local policy:** Owner and member remain membership roles and are not duplicated as assignments.

### `list-organization-role-assignments` [planned]

- **Type:** `query`
- **Application boundary:** `ListOrganizationRoleAssignmentsUseCase.listOrganizationRoleAssignments()`
- **Public entrypoint:** `server-api.ts#listOrganizationRoleAssignments`
- **Input:** Actor account ID and organization ID.
- **Success result:** Active account and team role assignments.
- **Expected rejections:** `permission-denied`
- **Authorization:** Active organization owner.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`, `organizations/organization-teams::OrganizationTeamReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-roles-source-02`
- **Local policy:** Assignment administration is owner-only.

### `assign-organization-role` [planned]

- **Type:** `command`
- **Application boundary:** `AssignOrganizationRoleUseCase.assignOrganizationRole()`
- **Public entrypoint:** `server-api.ts#assignOrganizationRole`
- **Input:** Actor account ID, organization ID, predefined role key, and account or team subject.
- **Success result:** Active `OrganizationRoleAssignmentReference`.
- **Expected rejections:** `permission-denied`, `role-not-found`, `subject-not-eligible`, `assignment-conflict`
- **Authorization:** Active organization owner.
- **Transaction:** One organization-role assignment transaction.
- **Idempotency:** Duplicate `(organization, subject, role)` is rejected.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`, `organizations/organization-teams::OrganizationTeamReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-roles-source-02`
- **Local policy:** Team assignments apply only to direct active team members.

### `revoke-organization-role` [planned]

- **Type:** `command`
- **Application boundary:** `RevokeOrganizationRoleUseCase.revokeOrganizationRole()`
- **Public entrypoint:** `server-api.ts#revokeOrganizationRole`
- **Input:** Actor account ID, organization ID, and assignment ID.
- **Success result:** Revoked `OrganizationRoleAssignmentReference`.
- **Expected rejections:** `permission-denied`, `assignment-not-found`
- **Authorization:** Active organization owner.
- **Transaction:** One organization-role assignment transaction.
- **Idempotency:** Missing active assignment is rejected.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-roles-source-02`
- **Local policy:** Revocation takes effect on the next permission resolution.

### `resolve-organization-repository-role-contributions` [planned]

- **Type:** `query`
- **Application boundary:** `ResolveOrganizationRepositoryRoleContributionsUseCase.resolveOrganizationRepositoryRoleContributions()`
- **Public entrypoint:** `server-api.ts#resolveOrganizationRepositoryRoleContributions`
- **Input:** Organization ID and account ID.
- **Success result:** Active source-attributed repository permission contributions.
- **Expected rejections:** `none`
- **Authorization:** Internal repository-authorization integration contract.
- **Transaction:** Read-only aggregation.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organization-memberships::OrganizationMembershipReference`, `organizations/organization-teams::OrganizationTeamReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-roles-source-03`
- **Local policy:** Security manager contributes read; all-repository roles contribute their named level; other roles contribute none.

## Ubiquitous language

- **Predefined organization role:** Immutable GitHub-defined set of
  organization and repository permissions.
- **Role assignment:** Active association between one predefined role and an
  eligible account or team subject.
- **Repository role contribution:** Permission supplied across every
  repository owned by the assignment's organization.

## Ownership and invariants

The predefined catalog contains moderator, security manager, CI/CD admin, app
manager, and all-repository read, triage, write, maintain, and admin. A subject
can hold multiple roles; one role can be assigned only once to the same subject.
Account subjects require active organization membership. Team subjects require
an active team in the same organization.

`owner` and `member` stay in organization memberships. Custom role definitions
remain catalog ownership but are not activated by this slice.

## Public capabilities

No runtime capability while planned. The approved application boundaries are
activated with management routes and repository-access integration.

## Dependencies and consistency

Planned synchronous dependencies are organization references, organization
memberships, and organization teams. Assignment resolution never reads another
context's persistence.

## Authorization

Active organization owners manage assignments. Active members may view the
predefined role catalog. Repository-access consumes a server-side integration
contract rather than assignment storage.

## Persistence and transactions

Definitions are immutable code data. Assignments use a versioned process-local
store indexed by organization, subject, and role. Commands mutate only this
store.

## Data classification

Role assignments and permission contributions are authorization-sensitive
organization data.

## Retention and erasure

Revoked assignments remain process-local tombstones and stop contributing.
Assignments whose subject becomes ineligible also stop contributing.

## Events and failure behavior

Catalog role events remain planned. Commands initially return explicit results
and do not publish events. Dependency failures propagate without partial
cross-context writes.

## Official sources

- `organizations-organization-roles-source-01`: [organization and custom role
  semantics](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization)
  (verified 2026-07-23)
- `organizations-organization-roles-source-02`: [role assignment to users and
  teams](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/using-organization-roles)
  (verified 2026-07-23)
- `organizations-organization-roles-source-03`: [predefined organization and
  all-repository role permissions](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-peoples-access-to-your-organization-with-roles/permissions-of-predefined-organization-roles)
  (verified 2026-07-23)

## Exceptions

Custom organization and custom repository role management remain planned until
entitlements and the fine-grained permission catalog are active.
