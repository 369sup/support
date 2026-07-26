# Enterprise Teams

## Purpose

Own enterprise-wide team identity, lifecycle, and direct membership for
centralized administration across an enterprise. Organization assignment,
roles, licenses, IdP synchronization, and repository grants remain separate
capabilities.

## Context content tree

- Enterprise team administration [active]
  - `create-enterprise-team`
  - `list-enterprise-teams`
  - `update-enterprise-team`
  - `delete-enterprise-team`
  - Owned: `EnterpriseTeam`
  - Enterprise owners create, edit, and delete teams.
  - Authorized enterprise administrators can list teams.
  - Team slugs are generated from team names.
- Direct enterprise team membership [active]
  - `add-enterprise-team-member`
  - `remove-enterprise-team-member`
  - `list-enterprise-team-members`
  - Owned: `EnterpriseTeamMembership`
  - Enterprise owners add or remove active personal or managed accounts.
  - Removing a member does not remove the user from the enterprise.
- Organization assignment [planned]
  - Owned: `EnterpriseTeamOrganizationGrant`
  - Assignment can add team members directly to an organization and grant its
    base repository permission.
  - Planned events:
    `EnterpriseTeamOrganizationGranted@1`,
    `EnterpriseTeamOrganizationRevoked@1`
- Planned team events:
  `EnterpriseTeamCreated@1`, `EnterpriseTeamUpdated@1`,
  `EnterpriseTeamDeleted@1`, `EnterpriseTeamMemberAdded@1`,
  `EnterpriseTeamMemberRemoved@1`
- External relationships
  - `enterprises/enterprises::EnterpriseReference`
  - `enterprises/enterprise-roles::EnterpriseAdministrationDecision`
  - `identity/accounts::AccountReference`
  - Planned `organizations/organizations::OrganizationReference`
  - Planned
    `organizations/organization-memberships::OrganizationMembership`
- Explicit exclusions
  - `OrganizationTeam`
  - `RepositoryGrant`
  - `CostCenter`
  - `ExternalGroupBinding`
  - `EnterpriseRoleAssignment`
  - `License`

## Designed use cases

### `add-enterprise-team-member` [active]

- **Type:** `command`
- **Application boundary:** `AddEnterpriseTeamMemberUseCase.addEnterpriseTeamMember()`
- **Public entrypoint:** `server-api.ts#addEnterpriseTeamMember`
- **Input:** Verified actor account ID, enterprise slug, enterprise team ID, and target username.
- **Success result:** `added` with the active membership and account reference.
- **Expected rejections:** `account-not-found`, `already-team-member`, `enterprise-not-found`, `permission-denied`, `team-member-limit-reached`, `team-not-found`
- **Authorization:** Enterprise owner decision from `enterprises/enterprise-roles`, evaluated before managed-account lookup or mutation.
- **Transaction:** One context-local membership record.
- **Idempotency:** A repeated active membership returns `already-team-member`.
- **Dependencies:** `enterprises/enterprises::EnterpriseReference`, `enterprises/enterprise-roles::EnterpriseAdministrationDecision`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprise-teams-source-02`, `enterprises-enterprise-teams-source-04`
- **Local policy:** This slice supports one member per command; bulk membership remains planned.

### `create-enterprise-team` [active]

- **Type:** `command`
- **Application boundary:** `CreateEnterpriseTeamUseCase.createEnterpriseTeam()`
- **Public entrypoint:** `server-api.ts#createEnterpriseTeam`
- **Input:** Verified actor account ID, enterprise slug, team name, and description.
- **Success result:** `created` with an active enterprise team.
- **Expected rejections:** `enterprise-not-found`, `invalid-name`, `permission-denied`, `team-limit-reached`, `team-slug-conflict`
- **Authorization:** Enterprise owner decision from `enterprises/enterprise-roles`.
- **Transaction:** One context-local team record.
- **Idempotency:** A repeated generated slug returns `team-slug-conflict`.
- **Dependencies:** `enterprises/enterprises::EnterpriseReference`, `enterprises/enterprise-roles::EnterpriseAdministrationDecision`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprise-teams-source-02`, `enterprises-enterprise-teams-source-03`
- **Local policy:** New teams default to no organization assignment; name and description receive bounded transport and domain validation.

### `delete-enterprise-team` [active]

- **Type:** `command`
- **Application boundary:** `DeleteEnterpriseTeamUseCase.deleteEnterpriseTeam()`
- **Public entrypoint:** `server-api.ts#deleteEnterpriseTeam`
- **Input:** Verified actor account ID, enterprise slug, and enterprise team ID.
- **Success result:** `deleted` with the process-local lifecycle record.
- **Expected rejections:** `enterprise-not-found`, `permission-denied`, `team-not-found`
- **Authorization:** Enterprise owner decision from `enterprises/enterprise-roles`.
- **Transaction:** One context-local team lifecycle transition.
- **Idempotency:** Repeating after deletion returns `team-not-found`.
- **Dependencies:** `enterprises/enterprises::EnterpriseReference`, `enterprises/enterprise-roles::EnterpriseAdministrationDecision`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprise-teams-source-03`
- **Local policy:** IdP mappings and organization grants are not active and therefore have no deletion side effect in this slice.

### `list-enterprise-team-members` [active]

- **Type:** `query`
- **Application boundary:** `ListEnterpriseTeamMembersUseCase.listEnterpriseTeamMembers()`
- **Public entrypoint:** `server-api.ts#listEnterpriseTeamMembers`
- **Input:** Verified actor account ID, enterprise slug, and enterprise team ID.
- **Success result:** `found` with up to 100 active membership views.
- **Expected rejections:** `enterprise-not-found`, `permission-denied`, `team-not-found`
- **Authorization:** Enterprise administration decision from `enterprises/enterprise-roles`.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `enterprises/enterprises::EnterpriseReference`, `enterprises/enterprise-roles::EnterpriseAdministrationDecision`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprise-teams-source-04`
- **Local policy:** Inactive account references are omitted from the bounded result.

### `list-enterprise-teams` [active]

- **Type:** `query`
- **Application boundary:** `ListEnterpriseTeamsUseCase.listEnterpriseTeams()`
- **Public entrypoint:** `server-api.ts#listEnterpriseTeams`
- **Input:** Verified actor account ID and enterprise slug.
- **Success result:** `found` with up to 100 active enterprise teams.
- **Expected rejections:** `enterprise-not-found`, `permission-denied`
- **Authorization:** Enterprise administration decision from `enterprises/enterprise-roles`.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `enterprises/enterprises::EnterpriseReference`, `enterprises/enterprise-roles::EnterpriseAdministrationDecision`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprise-teams-source-01`, `enterprises-enterprise-teams-source-03`
- **Local policy:** This first page is bounded to 100 teams; cursor pagination remains planned.

### `remove-enterprise-team-member` [active]

- **Type:** `command`
- **Application boundary:** `RemoveEnterpriseTeamMemberUseCase.removeEnterpriseTeamMember()`
- **Public entrypoint:** `server-api.ts#removeEnterpriseTeamMember`
- **Input:** Verified actor account ID, enterprise slug, enterprise team ID, and target account ID.
- **Success result:** `removed` with the inactive membership record.
- **Expected rejections:** `enterprise-not-found`, `membership-not-found`, `permission-denied`, `team-not-found`
- **Authorization:** Enterprise owner decision from `enterprises/enterprise-roles`.
- **Transaction:** One context-local membership transition.
- **Idempotency:** Repeating after removal returns `membership-not-found`.
- **Dependencies:** `enterprises/enterprises::EnterpriseReference`, `enterprises/enterprise-roles::EnterpriseAdministrationDecision`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprise-teams-source-02`, `enterprises-enterprise-teams-source-04`
- **Local policy:** Removing team membership never removes enterprise or organization membership.

### `update-enterprise-team` [active]

- **Type:** `command`
- **Application boundary:** `UpdateEnterpriseTeamUseCase.updateEnterpriseTeam()`
- **Public entrypoint:** `server-api.ts#updateEnterpriseTeam`
- **Input:** Verified actor account ID, enterprise slug, enterprise team ID, replacement name, and description.
- **Success result:** `updated` with the active enterprise team.
- **Expected rejections:** `enterprise-not-found`, `invalid-name`, `permission-denied`, `team-not-found`, `team-slug-conflict`
- **Authorization:** Enterprise owner decision from `enterprises/enterprise-roles`.
- **Transaction:** One context-local team record.
- **Idempotency:** Repeating the same profile produces the same stored value.
- **Dependencies:** `enterprises/enterprises::EnterpriseReference`, `enterprises/enterprise-roles::EnterpriseAdministrationDecision`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprise-teams-source-03`
- **Local policy:** Renaming regenerates the slug; organization selection, notification settings, and IdP bindings remain planned.

## Ubiquitous language

- **Enterprise team**: an enterprise-scoped group that may contain users from
  across the enterprise and its organizations.
- **Direct member**: a personal or managed user explicitly added to the team.
- **Enterprise team slug**: the name-derived identifier displayed with the
  `ent:` mention prefix.
- **Organization assignment**: a future team-to-organization grant with
  organization membership and base-permission effects.

## Ownership and invariants

This context owns `EnterpriseTeam`, `EnterpriseTeamMembership`, and
`EnterpriseTeamOrganizationGrant`. Active teams do not support nested teams,
secret visibility, or team maintainers. One enterprise can contain at most
2,500 active enterprise teams, and one enterprise team can contain at most
5,000 active members.

Organization teams, organization membership, enterprise roles, repository
grants, IdP group bindings, licenses, and cost centers remain outside this
context.

## Public capabilities

`server-api.ts` exposes bounded team CRUD, listing, and direct-member
operations. Contract types contain only stable team, membership, and account
reference fields needed by server consumers.

## Dependencies and consistency

Enterprise identity is resolved synchronously before authorization.
Enterprise-role authorization is resolved before protected data or managed
account lookup. Account references are resolved through the accounts public
server boundary; this context does not read account storage.

Organization assignment remains planned because it requires a coordinated
organization-membership write contract. No distributed transaction is
invented.

## Authorization

Every operation receives an authenticated actor account ID from delivery and
re-evaluates enterprise scope in the application service. Enterprise
administrators with an active administration decision may list teams and
members. Create, update, delete, add-member, and remove-member commands require
the `enterprise-owner` role. Denials do not disclose protected team or managed
account data.

## Persistence and transactions

The active slice uses one context-local process Map for team and membership
records. Each command changes one context-local record. There is no durable
transaction, cross-instance coordination, IdP synchronization, or
cross-context write.

## Data classification

Enterprise team names, slugs, descriptions, membership account IDs, and
enterprise-scoped user references are enterprise administration data. Email,
credentials, tokens, organization grants, repository permissions, and private
profile data are not stored.

## Retention and erasure

Records live for the process lifetime. Deleted teams and removed memberships
remain as process-local lifecycle records until restart. Durable retention,
eventual erasure, restore behavior, and IdP mapping cleanup remain planned.

## Events and failure behavior

Catalog events remain planned because no transactional event publisher is
owned by this slice. Expected absence, conflicts, limits, and authorization
denials use named result variants. Unexpected adapter failures propagate as
infrastructure failures.

## Official sources

- `enterprises-enterprise-teams-source-01`:
  <https://docs.github.com/en/enterprise-cloud@latest/admin/concepts/enterprise-fundamentals/teams-in-an-enterprise>
- `enterprises-enterprise-teams-source-02`:
  <https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/create-enterprise-teams>
- `enterprises-enterprise-teams-source-03`:
  <https://docs.github.com/en/rest/enterprise-teams/enterprise-teams>
- `enterprises-enterprise-teams-source-04`:
  <https://docs.github.com/en/rest/enterprise-teams/enterprise-team-members>

## Exceptions

None.
