# Enterprise Memberships

## Purpose

Own enterprise membership, invitation, affiliation, and guest collaborator
state without embedding administration roles.

## Context content tree

- Active affiliation [active]
  - `list-active-enterprise-affiliations-for-account`
  - Owned: `EnterpriseMembership`, `EnterpriseAffiliation`
- Invitations and guests [planned]
  - Owned: `EnterpriseInvitation`, `GuestCollaboratorStatus`
- Planned events
  - `EnterpriseInvitationCreated@1`, `EnterpriseInvitationAccepted@1`,
    `EnterpriseInvitationRevoked@1`, `EnterpriseMemberAdded@1`,
    `EnterpriseMemberRemoved@1`, `EnterpriseAffiliationChanged@1`,
    `GuestCollaboratorStatusChanged@1`
- External relationships
  - `enterprises/enterprises::EnterpriseReference`
  - `identity/accounts::AccountReference`
- Excludes
  - `OrganizationMembership`, `RepositoryGrant`, `License`

## Designed use cases

### `list-active-enterprise-affiliations-for-account` [active]

- **Type:** `query`
- **Application boundary:** `ListActiveEnterpriseAffiliationsForAccountUseCase.listActiveEnterpriseAffiliationsForAccount()`
- **Public entrypoint:** `server-api.ts#listActiveEnterpriseAffiliationsForAccount`
- **Input:** Account ID.
- **Success result:** Active enterprise affiliations, possibly empty.
- **Expected rejections:** `none`
- **Authorization:** Caller must already possess the authenticated account ID.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `enterprises/enterprises::EnterpriseReference`, `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprise-memberships-source-01`
- **Local policy:** Affiliation conveys no enterprise role or repository permission.

## Ubiquitous language

- **Enterprise affiliation**: direct or organization-derived enterprise
  association.

## Ownership and invariants

Membership and affiliation lifecycle are separate from role assignment.

## Public capabilities

The active query is exposed through `server-api.ts`.
`EnterpriseAffiliation` is the integration contract.

## Dependencies and consistency

Stable enterprise and account IDs are resolved through declared references.

## Authorization

Enterprise administration always requires a separate role decision.

## Persistence and transactions

A context-local process Map indexes affiliations by account ID.

## Data classification

Affiliation is account-associated product data.

## Retention and erasure

Fixtures live for the process lifetime.

## Events and failure behavior

The active query emits no events; catalog events remain planned.

## Official sources

- `enterprises-enterprise-memberships-source-01`: <https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-people-in-your-enterprise>

## Exceptions

None.
