# Organization Memberships

## Purpose

Own organization membership, direct invitations, member/owner role, state, and
membership source.

## Context content tree

- Membership eligibility [active]
  - `check-organization-context-eligibility`
  - `list-active-organization-memberships-for-account`
  - `list-active-organization-memberships-for-organization`
  - Owned: `OrganizationMembership`, `MembershipRole`, `MembershipState`
  - Only active membership is Dashboard-eligible.
- Direct invitation lifecycle [active]
  - `invite-organization-member`
  - `list-organization-invitations-for-organization`
  - `list-pending-organization-invitations-for-account`
  - `update-organization-invitation`
  - `cancel-organization-invitation`
  - `accept-organization-invitation`
  - `decline-organization-invitation`
  - Owned: `OrganizationInvitation`
  - Invitations target active personal accounts by username or verified email
    and expire after seven days; managed users are supplied through SCIM.
- Direct member lifecycle [active]
  - `change-organization-member-role`
  - `remove-organization-member`
  - The last active owner is protected.
- Enterprise-team membership synchronization [active]
  - `synchronize-enterprise-team-organization-memberships`
  - One assignment contributes active member membership without invitations.
  - Direct, identity-provider, and other enterprise assignment sources survive
    one assignment's removal.
- Planned events
  - `OrganizationInvitationCreated@1`, `OrganizationInvitationAccepted@1`,
    `OrganizationInvitationRevoked@1`, `OrganizationMemberAdded@1`,
    `OrganizationMemberRemoved@1`, `OrganizationMemberRoleChanged@1`
- External relationships
  - `organizations/organizations::OrganizationReference`
  - `identity/accounts::AccountReference`
  - planned `enterprises/enterprise-memberships::EnterpriseAffiliation`
- Excludes
  - `OutsideCollaborator`, `RepositoryInvitation`, `EnterpriseRole`

## Designed use cases

### `accept-organization-invitation` [active]

- **Type:** `command`
- **Application boundary:** `AcceptOrganizationInvitationUseCase.acceptOrganizationInvitation()`
- **Public entrypoint:** `server-api.ts#acceptOrganizationInvitation`
- **Input:** Authenticated actor account ID and invitation ID.
- **Success result:** Accepted invitation and active direct organization membership.
- **Expected rejections:** `already-member`, `invitation-expired`, `invitation-not-for-actor`, `invitation-not-found`, `invitation-not-pending`
- **Authorization:** Only the personal account targeted by the invitation may accept it.
- **Transaction:** Invitation acceptance and membership activation are saved atomically.
- **Idempotency:** A successful state transition is single-use; retries reject an invitation that is no longer pending.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-01`
- **Local policy:** Acceptance activates the pending direct membership without creating a second membership.

### `cancel-organization-invitation` [active]

- **Type:** `command`
- **Application boundary:** `CancelOrganizationInvitationUseCase.cancelOrganizationInvitation()`
- **Public entrypoint:** `server-api.ts#cancelOrganizationInvitation`
- **Input:** Authenticated owner account ID, organization ID, and invitation ID.
- **Success result:** Canceled invitation and removed pending membership.
- **Expected rejections:** `invitation-not-found`, `invitation-not-pending`, `permission-denied`
- **Authorization:** An active owner of the invitation's organization must authorize cancellation.
- **Transaction:** Invitation cancellation and pending membership removal are saved atomically.
- **Idempotency:** A successful cancellation is single-use; retries reject an invitation that is no longer pending or expired.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-03`
- **Local policy:** Expired invitations may be cleared through the same cancellation boundary.

### `change-organization-member-role` [active]

- **Type:** `command`
- **Application boundary:** `ChangeOrganizationMemberRoleUseCase.changeOrganizationMemberRole()`
- **Public entrypoint:** `server-api.ts#changeOrganizationMemberRole`
- **Input:** Authenticated owner account ID, organization ID, membership ID, and desired member or owner role.
- **Success result:** Active direct membership with its updated role.
- **Expected rejections:** `invalid-role`, `last-owner-protected`, `membership-managed-externally`, `membership-not-found`, `permission-denied`
- **Authorization:** An active organization owner may change a direct membership scoped to that organization.
- **Transaction:** One organization membership role is saved in the context-local repository.
- **Idempotency:** Repeating the same desired role preserves the same membership state.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-01`
- **Local policy:** The last active owner cannot be demoted, and externally managed memberships are read-only.

### `check-organization-context-eligibility` [active]

- **Type:** `query`
- **Application boundary:** `CheckOrganizationContextEligibilityUseCase.checkOrganizationContextEligibility()`
- **Public entrypoint:** `server-api.ts#checkOrganizationContextEligibility`
- **Input:** Account ID and organization ID.
- **Success result:** `eligible` with active membership.
- **Expected rejections:** `context-not-available`
- **Authorization:** The account ID must match the membership.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-01`
- **Local policy:** Pending, suspended, and removed membership is unavailable.

### `decline-organization-invitation` [active]

- **Type:** `command`
- **Application boundary:** `DeclineOrganizationInvitationUseCase.declineOrganizationInvitation()`
- **Public entrypoint:** `server-api.ts#declineOrganizationInvitation`
- **Input:** Authenticated actor account ID and invitation ID.
- **Success result:** Declined invitation and removed pending membership.
- **Expected rejections:** `invitation-expired`, `invitation-not-for-actor`, `invitation-not-found`, `invitation-not-pending`
- **Authorization:** Only the personal account targeted by the invitation may decline it.
- **Transaction:** Invitation decline and pending membership removal are saved atomically.
- **Idempotency:** A successful decline is single-use; retries reject an invitation that is no longer pending.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-01`
- **Local policy:** Decline is an explicit recipient decision and does not create active membership.

### `invite-organization-member` [active]

- **Type:** `command`
- **Application boundary:** `InviteOrganizationMemberUseCase.inviteOrganizationMember()`
- **Public entrypoint:** `server-api.ts#inviteOrganizationMember`
- **Input:** Authenticated owner account ID, organization ID, personal-account username or verified email, and member or owner role.
- **Success result:** Pending direct membership and invitation expiring exactly seven days after creation.
- **Expected rejections:** `account-not-found`, `already-member`, `invalid-role`, `invitation-already-pending`, `managed-account-requires-scim`, `permission-denied`
- **Authorization:** An active owner of the target organization must authorize the invitation.
- **Transaction:** Invitation and pending membership are created atomically.
- **Idempotency:** A duplicate active membership or pending invitation is rejected before new IDs are allocated.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-02`
- **Local policy:** Missing and unverified email targets share `account-not-found`; only active personal human accounts are accepted, and managed users remain SCIM-owned.

### `list-active-organization-memberships-for-account` [active]

- **Type:** `query`
- **Application boundary:** `ListActiveOrganizationMembershipsForAccountUseCase.listActiveOrganizationMembershipsForAccount()`
- **Public entrypoint:** `server-api.ts#listActiveOrganizationMembershipsForAccount`
- **Input:** Account ID.
- **Success result:** Active memberships, possibly empty.
- **Expected rejections:** `none`
- **Authorization:** Caller must already possess the authenticated account ID.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-01`
- **Local policy:** Membership source does not itself grant repository access.

### `list-active-organization-memberships-for-organization` [active]

- **Type:** `query`
- **Application boundary:** `ListActiveOrganizationMembershipsForOrganizationUseCase.listActiveOrganizationMembershipsForOrganization()`
- **Public entrypoint:** `server-api.ts#listActiveOrganizationMembershipsForOrganization`
- **Input:** Organization ID.
- **Success result:** Active memberships for the organization, possibly empty.
- **Expected rejections:** `none`
- **Authorization:** The caller must already possess an organization-scoped administration decision; this query does not grant access.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-01`
- **Local policy:** Pending, suspended, and removed memberships are excluded; membership state alone does not grant repository access.

### `list-organization-invitations-for-organization` [active]

- **Type:** `query`
- **Application boundary:** `ListOrganizationInvitationsForOrganizationUseCase.listOrganizationInvitationsForOrganization()`
- **Public entrypoint:** `server-api.ts#listOrganizationInvitationsForOrganization`
- **Input:** Authenticated owner account ID and organization ID.
- **Success result:** Organization invitations ordered newest first, including terminal states.
- **Expected rejections:** `permission-denied`
- **Authorization:** An active owner may list invitations for that organization.
- **Transaction:** Expired pending invitations and their memberships are transitioned atomically before returning the list.
- **Idempotency:** Repeated reads preserve terminal states and return the same order for unchanged data.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-03`
- **Local policy:** Expiration is enforced lazily by every invitation read or decision boundary.

### `list-pending-organization-invitations-for-account` [active]

- **Type:** `query`
- **Application boundary:** `ListPendingOrganizationInvitationsForAccountUseCase.listPendingOrganizationInvitationsForAccount()`
- **Public entrypoint:** `server-api.ts#listPendingOrganizationInvitationsForAccount`
- **Input:** Authenticated actor account ID.
- **Success result:** Pending invitations for that account ordered newest first.
- **Expected rejections:** `none`
- **Authorization:** The query is scoped to the authenticated account and exposes no other account's invitations.
- **Transaction:** Expired pending invitations and their memberships are transitioned atomically before filtering.
- **Idempotency:** Repeated reads preserve terminal states and return the same order for unchanged data.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-02`
- **Local policy:** Only still-pending invitations remain in the recipient inbox.

### `remove-organization-member` [active]

- **Type:** `command`
- **Application boundary:** `RemoveOrganizationMemberUseCase.removeOrganizationMember()`
- **Public entrypoint:** `server-api.ts#removeOrganizationMember`
- **Input:** Authenticated owner account ID, organization ID, and active membership ID.
- **Success result:** Direct membership in the removed state.
- **Expected rejections:** `last-owner-protected`, `membership-managed-externally`, `membership-not-found`, `permission-denied`
- **Authorization:** An active organization owner may remove a direct membership scoped to that organization.
- **Transaction:** One organization membership state is saved in the context-local repository.
- **Idempotency:** A successful removal is single-use; retries no longer find an active membership.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-04`
- **Local policy:** The last active owner cannot be removed, and externally managed memberships are read-only.

### `update-organization-invitation` [active]

- **Type:** `command`
- **Application boundary:** `UpdateOrganizationInvitationUseCase.updateOrganizationInvitation()`
- **Public entrypoint:** `server-api.ts#updateOrganizationInvitation`
- **Input:** Authenticated owner account ID, organization ID, invitation ID, and desired member or owner role.
- **Success result:** Pending invitation and pending membership with the updated role.
- **Expected rejections:** `invalid-role`, `invitation-expired`, `invitation-not-found`, `invitation-not-pending`, `permission-denied`
- **Authorization:** An active owner of the invitation's organization must authorize the update.
- **Transaction:** Invitation role and pending membership role are saved atomically.
- **Idempotency:** Repeating the same desired role preserves the same invitation and membership state.
- **Dependencies:** `organizations/organizations::OrganizationReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-03`
- **Local policy:** Editing changes the invited role without extending the original seven-day expiry.

### `synchronize-enterprise-team-organization-memberships` [active]

- **Type:** `command`
- **Application boundary:** `SynchronizeEnterpriseTeamOrganizationMembershipsUseCase.synchronizeEnterpriseTeamOrganizationMemberships()`
- **Public entrypoint:** `server-api.ts#synchronizeEnterpriseTeamOrganizationMemberships`
- **Input:** Trusted enterprise-team assignment ID, organization ID, and complete active team-member account ID set.
- **Success result:** `synchronized` with the resulting active organization memberships.
- **Expected rejections:** `none`
- **Authorization:** A trusted server-side enterprise-team coordinator must authorize the assignment before invoking this boundary; it is not exposed through a route.
- **Transaction:** Membership creation, activation, assignment-source replacement, removal, and pending-invitation cancellation commit in one context-owned PostgreSQL transaction.
- **Idempotency:** Repeating the same assignment and account set preserves the same memberships and source associations.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-memberships-source-05`
- **Local policy:** New memberships use member role and enterprise-managed source; direct and identity-provider membership survives synchronization, as does enterprise-managed membership supported by another assignment.

## Ubiquitous language

- **Membership role**: `member` or `owner`.
- **Membership state**: `active`, `pending`, `suspended`, or `removed`.
- **Invitation state**: `pending`, `accepted`, `declined`, `canceled`, or
  `expired`.
- **Direct membership**: Membership owned by this invitation/member lifecycle
  and mutable by an organization owner.
- **Externally managed membership**: Membership supplied by an enterprise team
  or identity-provider group and read-only in this context.
- **Enterprise assignment source**: One enterprise-team organization grant
  contributing an active organization membership.

## Ownership and invariants

Only this context owns membership, invitation, and assignment-source state. An organization never
embeds its membership collection. Every invitation references one pending
direct membership. Invitation decisions update both records atomically. A
membership collection must retain at least one active owner.

## Public capabilities

The thirteen active use cases are exposed explicitly through `server-api.ts`.
`OrganizationMembershipReference` and `OrganizationInvitationReference` are
the framework-free integration contracts.

## Dependencies and consistency

References use stable Account and Organization IDs. Account lookup is a trusted
server-side integration limited to active accounts. Enterprise-team assignment
uses the public synchronization boundary and records its assignment source
without exposing membership persistence.

## Authorization

Recipient decisions are scoped to the authenticated account ID. Organization
invitation and member administration requires an active owner membership in
the target organization. Server Actions reacquire the session, organization,
and membership decision for every mutation; client-provided IDs do not grant
authority.

## Persistence and transactions

Production composition stores memberships, invitations, and enterprise-team
assignment sources in context-owned PostgreSQL tables. The repository port
provides one atomic boundary for an invitation and its corresponding
membership. Enterprise assignments use an advisory lock and one database
transaction to replace the complete assignment source set and related pending
invitation decisions. Role changes and direct member removal update one
membership. In-memory adapters remain isolated development and test
alternatives.

## Data classification

Membership affiliation, invitation decisions, account IDs, inviter IDs, and
timestamps are account-associated product data. No credentials or email
addresses are stored here.

## Retention and erasure

Membership and invitation history is durable in PostgreSQL. Terminal invitation
states remain inspectable; final retention and erasure policy remains planned.

## Events and failure behavior

No events are published in this slice; cataloged lifecycle events remain
planned. Expected authorization, state, validation, and lookup failures return
discriminated results. A missing invitation membership is an invariant failure
and raises an error rather than exposing a partial state.

## Official sources

- `organizations-organization-memberships-source-01`: <https://docs.github.com/en/organizations/managing-membership-in-your-organization>
- `organizations-organization-memberships-source-02`: <https://docs.github.com/en/organizations/managing-membership-in-your-organization/inviting-users-to-join-your-organization>
- `organizations-organization-memberships-source-03`: <https://docs.github.com/en/organizations/managing-membership-in-your-organization/canceling-or-editing-an-invitation-to-join-your-organization>
- `organizations-organization-memberships-source-04`: <https://docs.github.com/en/organizations/managing-membership-in-your-organization/removing-a-member-from-your-organization>
- `organizations-organization-memberships-source-05`: <https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/create-enterprise-teams>

## Exceptions

None.
