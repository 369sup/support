# Entitlements Bounded Context

- **Catalog path:** `commerce/entitlements`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Plans, feature entitlements, licenses, assignments, and usage limits.

## Context content tree

- `commerce/entitlements` [planned]
  - Purpose: Plans, feature entitlements, licenses, assignments, and usage limits.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `Plan`
    - `FeatureEntitlement`
    - `License`
    - `LicenseAssignment`
    - `UsageLimit`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `PlanChanged@1` [planned]: plan changed.
    - `EntitlementGranted@1` [planned]: entitlement granted.
    - `EntitlementRevoked@1` [planned]: entitlement revoked.
    - `LicenseAssigned@1` [planned]: license assigned.
    - `LicenseRevoked@1` [planned]: license revoked.
    - `UsageLimitReached@1` [planned]: usage limit reached.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `commerce/billing::BillingStanding` (synchronous)
    - `identity/accounts::UserEntitlementOwner` (synchronous)
    - `organizations/organizations::OrganizationEntitlementOwner` (synchronous)
    - `enterprises/enterprises::EnterpriseEntitlementOwner` (synchronous)
- Explicit exclusions
  - `Invoice`
  - `OrganizationMembership`
  - `EnterpriseRole`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `Plan`, `FeatureEntitlement`, `License`, `LicenseAssignment`, `UsageLimit`.
It excludes `Invoice`, `OrganizationMembership`, `EnterpriseRole`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `commerce/billing::BillingStanding` (synchronous)
- `identity/accounts::UserEntitlementOwner` (synchronous)
- `organizations/organizations::OrganizationEntitlementOwner` (synchronous)
- `enterprises/enterprises::EnterpriseEntitlementOwner` (synchronous)

## Official sources

- `commerce-entitlements-source-01`: [plans, licenses, license assignment, usage limits](https://docs.github.com/en/billing/how-tos/manage-plan-and-licenses) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
