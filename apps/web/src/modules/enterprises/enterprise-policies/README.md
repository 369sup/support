# Enterprise Policies Bounded Context

- **Catalog path:** `enterprises/enterprise-policies`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Enterprise policy constraints applied across owned organizations and repositories.

## Context content tree

- `enterprises/enterprise-policies` [planned]
  - Purpose: Enterprise policy constraints applied across owned organizations and repositories.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `EnterprisePolicy`
    - `EnterprisePolicyEnforcement`
    - `OrganizationPolicyOverrideState`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `EnterprisePolicyChanged@1` [planned]: enterprise policy changed.
    - `EnterprisePolicyEnforcementChanged@1` [planned]: enterprise policy enforcement changed.
    - `OrganizationPolicyOverrideChanged@1` [planned]: organization policy override changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `enterprises/enterprises::EnterpriseReference` (synchronous)
- Explicit exclusions
  - `OrganizationPolicy`
  - `CodeRuleset`
  - `ActionsPolicy`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `EnterprisePolicy`
- `EnterprisePolicyEnforcement`
- `OrganizationPolicyOverrideState`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `EnterprisePolicy`, `EnterprisePolicyEnforcement`, `OrganizationPolicyOverrideState`.
It excludes `OrganizationPolicy`, `CodeRuleset`, `ActionsPolicy`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `EnterprisePolicyChanged@1` (domain, planned): enterprise policy changed. contract and ordering pending activation.
- `EnterprisePolicyEnforcementChanged@1` (domain, planned): enterprise policy enforcement changed. contract and ordering pending activation.
- `OrganizationPolicyOverrideChanged@1` (domain, planned): organization policy override changed. contract and ordering pending activation.

## Official sources

- `enterprises-enterprise-policies-source-01`: [enterprise policies, organization constraints, repository management policies](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
