# Billing Bounded Context

- **Catalog path:** `commerce/billing`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Billing accounts, payment profiles, usage, budgets, cost centers, invoices, and spending allocation.

## Context content tree

- `commerce/billing` [planned]
  - Purpose: Billing accounts, payment profiles, usage, budgets, cost centers, invoices, and spending allocation.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `BillingAccount`
    - `PaymentProfile`
    - `UsageRecord`
    - `Budget`
    - `CostCenter`
    - `Invoice`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `BillingAccountCreated@1` [planned]: billing account created.
    - `BillingAccountUpdated@1` [planned]: billing account updated.
    - `PaymentProfileUpdated@1` [planned]: payment profile updated.
    - `UsageRecorded@1` [planned]: usage recorded.
    - `BudgetCreated@1` [planned]: budget created.
    - `BudgetUpdated@1` [planned]: budget updated.
    - `BudgetExceeded@1` [planned]: budget exceeded.
    - `CostCenterCreated@1` [planned]: cost center created.
    - `CostCenterUpdated@1` [planned]: cost center updated.
    - `CostCenterDeleted@1` [planned]: cost center deleted.
    - `InvoiceIssued@1` [planned]: invoice issued.
    - `InvoicePaid@1` [planned]: invoice paid.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::PersonalBillingOwner` (synchronous)
    - `organizations/organizations::OrganizationBillingOwner` (synchronous)
    - `enterprises/enterprises::EnterpriseBillingOwner` (synchronous)
- Explicit exclusions
  - `FeatureEntitlement`
  - `LicenseAssignment`
  - `PaymentProviderRecord`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `BillingAccount`, `PaymentProfile`, `UsageRecord`, `Budget`, `CostCenter`, `Invoice`.
It excludes `FeatureEntitlement`, `LicenseAssignment`, `PaymentProviderRecord`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::PersonalBillingOwner` (synchronous)
- `organizations/organizations::OrganizationBillingOwner` (synchronous)
- `enterprises/enterprises::EnterpriseBillingOwner` (synchronous)

## Official sources

- `commerce-billing-source-01`: [billing accounts, usage, budgets, cost centers](https://docs.github.com/en/billing/get-started/introduction-to-billing) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
