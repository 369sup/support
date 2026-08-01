# Site Content Bounded Context

- **Catalog path:** `platform/site-content`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Stable public product, documentation, accessibility, policy, and informational page content.

## Context content tree

- `platform/site-content` [planned]
  - Approved use cases: `get-site-content-page`
  - Owned concepts: `SiteContentPage`, `SiteContentSlug`, `SitePolicyReference`
  - Published events: none; Read-only site content does not publish domain events before activation.
- Planned relationships
  - None.
- Explicit exclusions: `RepositoryContent`, `UserGeneratedContent`, `LegalPolicyAuthorship`

## Designed use cases

### `get-site-content-page` [planned]

- **Type:** `query`
- **Application boundary:** `GetSiteContentPageUseCase.getSiteContentPage()`
- **Public entrypoint:** `server-api.ts#getSiteContentPage`
- **Input:** A cataloged site-content slug.
- **Success result:** The published page content and canonical route metadata.
- **Expected rejections:** `site-content-not-found`
- **Authorization:** None; only explicitly public content is returned.
- **Transaction:** Read-only snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `platform-site-content-source-01`
- **Local policy:** Only cataloged slugs are readable; legal text remains externally governed and is referenced rather than invented.

## Ownership and invariants

This context alone owns `SiteContentPage`, `SiteContentSlug`, `SitePolicyReference`.
It explicitly excludes `RepositoryContent`, `UserGeneratedContent`, `LegalPolicyAuthorship`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

None.

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `platform-site-content-source-01`: [public policy navigation, stable site content routes](https://docs.github.com/en/site-policy) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
