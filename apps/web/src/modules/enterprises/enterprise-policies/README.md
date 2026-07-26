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

## Ownership and invariants

This context owns `EnterprisePolicy`, `EnterprisePolicyEnforcement`, `OrganizationPolicyOverrideState`.
It excludes `OrganizationPolicy`, `CodeRuleset`, `ActionsPolicy`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)

## Official sources

- `enterprises-enterprise-policies-source-01`: [enterprise policies, organization constraints, repository management policies](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
