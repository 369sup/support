# Enterprises

## Purpose

Own enterprise identity, type, lifecycle, and authoritative links to
organizations. Enterprises do not directly own repositories.

## Context content tree

- Enterprise discovery [active]
  - `create-enterprise`
  - `attach-enterprise-organization`
  - `get-enterprise-by-slug`
  - `get-enterprise-reference-by-id`
  - `list-enterprise-organizations`
  - Owned: `Enterprise`, `EnterpriseType`, `EnterpriseLifecycle`,
    `EnterpriseOrganizationLink`
- Planned events
  - `EnterpriseCreated@1`, `EnterpriseProfileUpdated@1`,
    `EnterpriseOrganizationLinked@1`, `EnterpriseOrganizationUnlinked@1`,
    `EnterpriseLifecycleChanged@1`
- External relationships
  - `organizations/organizations::OrganizationReference`
  - planned `identity/accounts::ActorReference`
- Excludes
  - `EnterpriseMembership`, `EnterpriseRole`, `EnterprisePolicy`

## Designed use cases

### `create-enterprise` [active]

- **Type:** `command`
- **Application boundary:** `CreateEnterpriseUseCase.createEnterprise()`
- **Public entrypoint:** `server-api.ts#createEnterprise`
- **Input:** Authenticated actor account ID, slug, and display name.
- **Success result:** `created` with enterprise ID and slug.
- **Expected rejections:** `invalid-slug`, `invalid-display-name`,
  `slug-conflict`, `service-unavailable`
- **Authorization:** Any authenticated account may bootstrap a standard
  enterprise and becomes its first owner.
- **Transaction:** Enterprise, direct membership, and enterprise-owner role
  assignment are inserted atomically.
- **Idempotency:** Unique normalized slug rejects duplicates.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprises-source-01`
- **Local policy:** Billing and sales-assisted provisioning are excluded.

### `attach-enterprise-organization` [active]

- **Type:** `command`
- **Application boundary:** `AttachEnterpriseOrganizationUseCase.attachEnterpriseOrganization()`
- **Public entrypoint:** `server-api.ts#attachEnterpriseOrganization`
- **Input:** Enterprise ID and standalone organization ID.
- **Success result:** `attached`.
- **Expected rejections:** `organization-already-attached`,
  `service-unavailable`
- **Authorization:** The transport must verify enterprise-owner administration.
- **Transaction:** A unique organization link is inserted.
- **Idempotency:** Repeated attachment returns a named conflict.
- **Dependencies:** `organizations/organizations::OrganizationReference`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprises-source-01`
- **Local policy:** One organization can belong to at most one enterprise.

### `get-enterprise-by-slug` [active]

- **Type:** `query`
- **Application boundary:** `GetEnterpriseBySlugUseCase.getEnterpriseBySlug()`
- **Public entrypoint:** `server-api.ts#getEnterpriseBySlug`
- **Input:** Enterprise slug.
- **Success result:** `found` with active enterprise reference.
- **Expected rejections:** `enterprise-not-found`
- **Authorization:** Public identity lookup only.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprises-source-01`
- **Local policy:** Suspended and deleted enterprises are absent.

### `get-enterprise-reference-by-id` [active]

- **Type:** `query`
- **Application boundary:** `GetEnterpriseReferenceByIdUseCase.getEnterpriseReferenceById()`
- **Public entrypoint:** `server-api.ts#getEnterpriseReferenceById`
- **Input:** Enterprise ID.
- **Success result:** `found` with active enterprise reference.
- **Expected rejections:** `enterprise-not-found`
- **Authorization:** None; public identity only.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprises-source-01`
- **Local policy:** Suspended and deleted enterprises are absent.

### `list-enterprise-organizations` [active]

- **Type:** `query`
- **Application boundary:** `ListEnterpriseOrganizationsUseCase.listEnterpriseOrganizations()`
- **Public entrypoint:** `server-api.ts#listEnterpriseOrganizations`
- **Input:** Enterprise slug.
- **Success result:** `found` with enterprise and active linked organizations.
- **Expected rejections:** `enterprise-not-found`
- **Authorization:** Transport caller must separately obtain enterprise administration authorization.
- **Transaction:** Read-only cross-context composition.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organizations::OrganizationReference`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprises-source-02`
- **Local policy:** The enterprise context owns links; organizations own identity.

## Ubiquitous language

- **Enterprise organization link**: the authoritative relation that an
  enterprise contains an organization.

## Ownership and invariants

An enterprise contains organizations and never enters the repository owner
union.

## Public capabilities

The active commands and queries are exposed through `server-api.ts`.
`EnterpriseReference` is the integration contract.

## Dependencies and consistency

Organization references are resolved synchronously. Production bootstrap and
link persistence use PostgreSQL constraints and transactions.

## Authorization

The identity query is public. Enterprise organization administration is
protected at HTTP and page boundaries by `enterprise-roles`.

## Persistence and transactions

Production uses PostgreSQL for enterprise identity, membership, owner roles,
and organization links. Development queries retain the process adapter.

## Data classification

Enterprise ID, slug, display name, type, and linked organization identities are
product identifiers.

## Retention and erasure

Enterprise identity and organization links are durable in PostgreSQL.
Additional lifecycle transitions and final erasure remain planned.

## Events and failure behavior

The active queries emit no events; catalog events remain planned.

## Official sources

- `enterprises-enterprises-source-01`: <https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories>
- `enterprises-enterprises-source-02`: <https://docs.github.com/en/enterprise-cloud@latest/get-started/learning-about-github/types-of-github-accounts>

## Exceptions

None.
