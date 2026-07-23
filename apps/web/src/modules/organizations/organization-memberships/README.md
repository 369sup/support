# Organization Memberships

## Purpose

Own organization membership, invitations, member/owner role, state, and source.

## Context content tree

- Membership eligibility [active]
  - `check-organization-context-eligibility`
  - `list-active-organization-memberships-for-account`
  - Owned: `OrganizationMembership`, `MembershipRole`, `MembershipState`
  - Only active membership is Dashboard-eligible.
- Invitations [planned]
  - Owned: `OrganizationInvitation`
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

## Ubiquitous language

- **Membership role**: `member` or `owner`.
- **Membership state**: `active`, `pending`, `suspended`, or `removed`.

## Ownership and invariants

Only this context owns membership state. An organization never embeds its
membership collection.

## Public capabilities

The two active queries are exposed through `server-api.ts`.
`OrganizationMembershipReference` is the integration contract.

## Dependencies and consistency

References use stable Account and Organization IDs. Enterprise-derived source
semantics remain a planned relationship.

## Authorization

Eligibility is always evaluated for the authenticated account ID and requested
organization ID; client-provided IDs are not trusted by themselves.

## Persistence and transactions

Context-local process Maps index account and account/organization pairs.

## Data classification

Membership affiliation is account-associated product data.

## Retention and erasure

Fixtures live for the process lifetime. Durable invitation retention remains
planned.

## Events and failure behavior

The active queries emit no events. Expected ineligibility is discriminated.

## Official sources

- `organizations-organization-memberships-source-01`: <https://docs.github.com/en/organizations/managing-membership-in-your-organization>

## Exceptions

None.
