# Marketplace Catalog Bounded Context

- **Catalog path:** `integrations/marketplace-catalog`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Marketplace listing metadata, categories, publication state, and public discovery.

## Context content tree

- `integrations/marketplace-catalog` [planned]
  - Approved use cases: `list-marketplace-listings`, `get-marketplace-listing`
  - Owned concepts: `MarketplaceListing`, `MarketplaceCategory`, `ListingPublicationState`
  - Published events: none; Catalog queries publish no events before listing administration is activated.
- Planned relationships
  - `commerce/entitlements::MarketplaceEntitlementReference`
- Explicit exclusions: `EntitlementDecision`, `BillingTransaction`, `ApplicationInstallation`

## Designed use cases

### `list-marketplace-listings` [planned]

- **Type:** `query`
- **Application boundary:** `ListMarketplaceListingsUseCase.listMarketplaceListings()`
- **Public entrypoint:** `server-api.ts#listMarketplaceListings`
- **Input:** An optional category slug and page cursor.
- **Success result:** A page of published marketplace listing summaries.
- **Expected rejections:** `category-not-found`
- **Authorization:** None for published listings.
- **Transaction:** Read-only catalog snapshot.
- **Idempotency:** Query.
- **Dependencies:** `commerce/entitlements::MarketplaceEntitlementReference`
- **Published events:** `none`
- **Official evidence:** `integrations-marketplace-catalog-source-01`
- **Local policy:** Catalog visibility never grants an entitlement or installation permission.

### `get-marketplace-listing` [planned]

- **Type:** `query`
- **Application boundary:** `GetMarketplaceListingUseCase.getMarketplaceListing()`
- **Public entrypoint:** `server-api.ts#getMarketplaceListing`
- **Input:** A marketplace listing slug.
- **Success result:** One published marketplace listing with plan summaries.
- **Expected rejections:** `listing-not-found`
- **Authorization:** None for published listings.
- **Transaction:** Read-only catalog snapshot.
- **Idempotency:** Query.
- **Dependencies:** `commerce/entitlements::MarketplaceEntitlementReference`
- **Published events:** `none`
- **Official evidence:** `integrations-marketplace-catalog-source-01`
- **Local policy:** Catalog visibility never grants an entitlement or installation permission.

## Ownership and invariants

This context alone owns `MarketplaceListing`, `MarketplaceCategory`, `ListingPublicationState`.
It explicitly excludes `EntitlementDecision`, `BillingTransaction`, `ApplicationInstallation`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

- `commerce/entitlements::MarketplaceEntitlementReference` (`synchronous`)

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `integrations-marketplace-catalog-source-01`: [marketplace listing catalog, listing discovery](https://docs.github.com/en/apps/github-marketplace/github-marketplace-overview) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
