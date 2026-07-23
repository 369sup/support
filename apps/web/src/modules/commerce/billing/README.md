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

## Ubiquitous language

The catalog reserves these terms for this context:

- `BillingAccount`
- `PaymentProfile`
- `UsageRecord`
- `Budget`
- `CostCenter`
- `Invoice`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `BillingAccount`, `PaymentProfile`, `UsageRecord`, `Budget`, `CostCenter`, `Invoice`.
It excludes `FeatureEntitlement`, `LicenseAssignment`, `PaymentProviderRecord`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::PersonalBillingOwner` (synchronous)
- `organizations/organizations::OrganizationBillingOwner` (synchronous)
- `enterprises/enterprises::EnterpriseBillingOwner` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `BillingAccountCreated@1` (domain, planned): billing account created. contract and ordering pending activation.
- `BillingAccountUpdated@1` (domain, planned): billing account updated. contract and ordering pending activation.
- `PaymentProfileUpdated@1` (domain, planned): payment profile updated. contract and ordering pending activation.
- `UsageRecorded@1` (domain, planned): usage recorded. contract and ordering pending activation.
- `BudgetCreated@1` (domain, planned): budget created. contract and ordering pending activation.
- `BudgetUpdated@1` (domain, planned): budget updated. contract and ordering pending activation.
- `BudgetExceeded@1` (domain, planned): budget exceeded. contract and ordering pending activation.
- `CostCenterCreated@1` (domain, planned): cost center created. contract and ordering pending activation.
- `CostCenterUpdated@1` (domain, planned): cost center updated. contract and ordering pending activation.
- `CostCenterDeleted@1` (domain, planned): cost center deleted. contract and ordering pending activation.
- `InvoiceIssued@1` (domain, planned): invoice issued. contract and ordering pending activation.
- `InvoicePaid@1` (domain, planned): invoice paid. contract and ordering pending activation.

## Official sources

- `commerce-billing-source-01`: [billing accounts, usage, budgets, cost centers](https://docs.github.com/en/billing/get-started/introduction-to-billing) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
