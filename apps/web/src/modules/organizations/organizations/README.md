# Organizations

## Purpose

Own organization identity, login, profile, lifecycle, and verified domains.
Enterprise organization links are owned by `enterprises/enterprises`.

## Context content tree

- Organization discovery [active]
  - `create-organization`
  - `get-organization-by-login`
  - `get-organization-reference-by-id`
  - Owned: `Organization`, `OrganizationProfile`, `OrganizationLifecycle`
  - Active-only organizations are returned.
- Verified domains [planned]
  - Owned: `VerifiedDomain`
- Planned events
  - `OrganizationCreated@1`, `OrganizationProfileUpdated@1`,
    `OrganizationRenamed@1`, `OrganizationLifecycleChanged@1`,
    `VerifiedDomainAdded@1`, `VerifiedDomainRemoved@1`
- Excludes
  - `OrganizationMembership`, `OrganizationTeam`, `Repository`,
    `EnterpriseOrganizationLink`

## Designed use cases

### `create-organization` [active]

- **Type:** `command`
- **Application boundary:** `CreateOrganizationUseCase.createOrganization()`
- **Public entrypoint:** `server-api.ts#createOrganization`
- **Input:** Authenticated actor account ID, organization login, display name.
- **Success result:** `created` with organization ID and login.
- **Expected rejections:** `invalid-login`, `invalid-display-name`,
  `login-conflict`, `service-unavailable`
- **Authorization:** Any authenticated personal account may bootstrap a
  standalone organization and becomes its first owner.
- **Transaction:** Organization and first owner membership are inserted in one
  PostgreSQL transaction.
- **Idempotency:** Unique normalized login rejects duplicates.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `organizations-organizations-source-01`
- **Local policy:** The final active owner is protected by the membership
  database trigger.

### `get-organization-by-login` [active]

- **Type:** `query`
- **Application boundary:** `GetOrganizationByLoginUseCase.getOrganizationByLogin()`
- **Public entrypoint:** `server-api.ts#getOrganizationByLogin`
- **Input:** Organization login.
- **Success result:** `found` with active organization reference.
- **Expected rejections:** `organization-not-found`
- **Authorization:** None; public identity only.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `organizations-organizations-source-01`
- **Local policy:** Empty, suspended, and deleted organizations are absent.

### `get-organization-reference-by-id` [active]

- **Type:** `query`
- **Application boundary:** `GetOrganizationReferenceByIdUseCase.getOrganizationReferenceById()`
- **Public entrypoint:** `server-api.ts#getOrganizationReferenceById`
- **Input:** Organization ID.
- **Success result:** `found` with active organization reference.
- **Expected rejections:** `organization-not-found`
- **Authorization:** None; public identity only.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `organizations-organizations-source-01`
- **Local policy:** Suspended and deleted organizations are absent.

## Ubiquitous language

- **Organization**: a shared account that groups people and repositories but
  cannot authenticate.
- **Organization login**: the public organization namespace.

## Ownership and invariants

Organization identity is separate from user accounts and from memberships.
Enterprise ownership links are excluded to preserve one authority.

## Public capabilities

The active command and two queries are exposed through `server-api.ts`.
`OrganizationReference` and `OrganizationOwnerReference` are integration
contracts.

## Dependencies and consistency

The active queries have no cross-context dependencies. Fixed fixture IDs are
validated by scenario integration tests.

## Authorization

Public identity lookup requires no authorization. Creation requires an
authenticated account and binds that account as the first owner.

## Persistence and transactions

Production uses PostgreSQL with normalized-login uniqueness. Development
queries retain the process adapter; bootstrap creation fails closed without
durable storage.

## Data classification

Organization ID, login, and display name are public identifiers.

## Retention and erasure

Fixtures live for the process lifetime. Durable lifecycle behavior remains
planned.

## Events and failure behavior

The active slice emits no events; catalog events remain planned. Expected
absence is a named result.

## Official sources

- `organizations-organizations-source-01`: <https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations>

## Exceptions

None.
