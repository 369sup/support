# Enterprises

## Purpose

Own enterprise identity, type, lifecycle, and authoritative links to
organizations. Enterprises do not directly own repositories.

## Context content tree

- Enterprise discovery [active]
  - `get-enterprise-by-slug`
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

The active queries are exposed through `server-api.ts`.
`EnterpriseReference` is the integration contract.

## Dependencies and consistency

Organization references are resolved synchronously; no shared storage or
cross-context transaction is used.

## Authorization

The identity query is public. Enterprise organization administration is
protected at HTTP and page boundaries by `enterprise-roles`.

## Persistence and transactions

A versioned context-local process Map stores enterprise records and links.

## Data classification

Enterprise ID, slug, display name, type, and linked organization identities are
product identifiers.

## Retention and erasure

Fixtures live for the process lifetime. Durable lifecycle transitions remain
planned.

## Events and failure behavior

The active queries emit no events; catalog events remain planned.

## Official sources

- `enterprises-enterprises-source-01`: <https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories>
- `enterprises-enterprises-source-02`: <https://docs.github.com/en/enterprise-cloud@latest/get-started/learning-about-github/types-of-github-accounts>

## Exceptions

None.
