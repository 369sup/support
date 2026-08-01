# Custom Properties Bounded Context

- **Catalog path:** `organizations/custom-properties`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `validated`

## Purpose

Own organization-defined repository property schemas and typed repository
property values.

## Context content tree

- Property schema [active]
  - `define-organization-repository-property`
  - `list-organization-repository-properties`
  - Owned: `OrganizationRepositoryPropertyDefinition`,
    `OrganizationRepositoryPropertyAllowedValue`,
    `RequiredRepositoryPropertyPolicy`,
    `ExplicitRepositoryPropertyRequirement`,
    `OrganizationRepositoryPropertyPromotionRequest`
- Repository values [active]
  - `set-repository-property-values`
  - `search-repositories-by-property`
  - Owned: `RepositoryPropertyValue`, `RepositoryPropertyValueSource`
- Excludes
  - Enterprise property definitions, ruleset targeting, repository topics,
    project fields, and issue fields.
- Planned events
  - `OrganizationRepositoryPropertyDefined@1`
  - `OrganizationRepositoryPropertyUpdated@1`
  - `OrganizationRepositoryPropertyDeleted@1`
  - `OrganizationRepositoryPropertyPromotionRequested@1`
  - `RepositoryPropertyValueSet@1`
  - `RepositoryPropertyValueCleared@1`

## Designed use cases

### `define-organization-repository-property` [active]

- **Type:** `command`
- **Application boundary:** `DefineOrganizationRepositoryPropertyUseCase.defineOrganizationRepositoryProperty()`
- **Public entrypoint:** `server-api.ts#defineOrganizationRepositoryProperty`
- **Input:** Organization, name, description, type, allowed values, default,
  required/explicit flags, and repository-actor setting.
- **Success result:** `defined` with property ID.
- **Expected rejections:** `invalid-name`, `invalid-description`,
  `invalid-allowed-values`, `invalid-default-value`, `name-conflict`
- **Authorization:** Organization owner at the delivery boundary.
- **Transaction:** One unique schema insert.
- **Idempotency:** Normalized organization/name uniqueness.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `organizations-custom-properties-source-01`
- **Local policy:** Names use GitHub’s allowed character set and 75-character
  maximum.

### `list-organization-repository-properties` [active]

- **Type:** `query`
- **Application boundary:** `ListOrganizationRepositoryPropertiesUseCase.listOrganizationRepositoryProperties()`
- **Public entrypoint:** `server-api.ts#listOrganizationRepositoryProperties`
- **Input:** Organization ID.
- **Success result:** Ordered schema definitions.
- **Expected rejections:** `none`
- **Authorization:** Organization owner at the delivery boundary.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `organizations-custom-properties-source-01`
- **Local policy:** Schema management is owner-only.

### `set-repository-property-values` [active]

- **Type:** `command`
- **Application boundary:** `SetRepositoryPropertyValuesUseCase.setRepositoryPropertyValues()`
- **Public entrypoint:** `server-api.ts#setRepositoryPropertyValues`
- **Input:** Repository batch, schema definitions, requested values, actor.
- **Success result:** `updated`.
- **Expected rejections:** `invalid-value`, `required-value-missing`
- **Authorization:** Organization owner or a repository actor allowed by the
  selected definition; delivery adapters must resolve repository access.
- **Transaction:** The entire repository batch is upserted atomically.
- **Idempotency:** Repository/property primary key upsert.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `organizations-custom-properties-source-01`
- **Local policy:** Required explicit values cannot be satisfied solely by a
  default.

### `search-repositories-by-property` [active]

- **Type:** `query`
- **Application boundary:** `SearchRepositoriesByPropertyUseCase.searchRepositoriesByProperty()`
- **Public entrypoint:** `server-api.ts#searchRepositoriesByProperty`
- **Input:** Organization, property name, and value.
- **Success result:** Matching active repository IDs.
- **Expected rejections:** `none`
- **Authorization:** Callers filter results through repository visibility and
  effective read permission before delivery.
- **Transaction:** Read-only indexed JSON search.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `organizations-custom-properties-source-01`
- **Local policy:** Public property visibility follows repository visibility.

## Ubiquitous language

- **Property definition:** Organization-owned typed metadata schema.
- **Explicit value:** A repository-specific value supplied by an authorized
  actor.
- **Default value:** The value inherited when no explicit value exists.

## Ownership and invariants

Definitions are unique by normalized name within an organization. Supported
types are text, single select, multi select, and true/false. Required values,
defaults, allowed values, and explicit-value requirements are validated before
storage.

## Public capabilities

`server-api.ts` exports the four active use cases and contract types. No
Supabase or PostgreSQL type crosses the entrypoint.

## Dependencies and consistency

Organization identity and repository lifecycle are synchronous references.
Batch value updates are a single database transaction.

## Authorization

The settings page requires an active organization-owner membership. Server
delivery of repository values must apply repository visibility and effective
read permission; product roles never come from Supabase user metadata.

## Persistence and transactions

Production uses `support_organization_repository_properties` and
`support_repository_property_values`. Both have RLS enabled with no browser
policies. Development uses a process adapter.

## Data classification

Property schemas and values are product metadata. A property on a public
repository may be public; private/internal values require effective read
permission. Secrets and credentials are invalid property content.

## Retention and erasure

Definitions and values follow organization and repository lifecycle. Destructive
schema deletion is not active in this slice.

## Events and failure behavior

Expected validation and uniqueness failures are named results. Event names are
catalogued; durable publication follows the shared context outbox.

## Official sources

- `organizations-custom-properties-source-01`: <https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization> (verified 2026-07-28)

## Exceptions

None.
