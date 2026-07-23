# Issue Schema Bounded Context

- **Catalog path:** `collaboration/issue-schema`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Organization-level issue type and field definitions, visibility, pinning, and type-field associations.

## Context content tree

- `collaboration/issue-schema` [planned]
  - Purpose: Organization-level issue type and field definitions, visibility, pinning, and type-field associations.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `IssueTypeDefinition`
    - `IssueFieldDefinition`
    - `IssueFieldVisibility`
    - `IssueFieldPinning`
    - `IssueTypeFieldAssociation`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `IssueTypeDefined@1` [planned]: issue type defined.
    - `IssueTypeUpdated@1` [planned]: issue type updated.
    - `IssueTypeRetired@1` [planned]: issue type retired.
    - `IssueFieldDefined@1` [planned]: issue field defined.
    - `IssueFieldUpdated@1` [planned]: issue field updated.
    - `IssueFieldRetired@1` [planned]: issue field retired.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `organizations/organization-policies::IssueSchemaPolicy` (synchronous)
    - `commerce/entitlements::IssueSchemaEntitlement` (synchronous)
- Explicit exclusions
  - `ProjectField`
  - `CustomPropertyDefinition`
  - `Label`
  - `IssueFieldValue`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `IssueTypeDefinition`
- `IssueFieldDefinition`
- `IssueFieldVisibility`
- `IssueFieldPinning`
- `IssueTypeFieldAssociation`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `IssueTypeDefinition`, `IssueFieldDefinition`, `IssueFieldVisibility`, `IssueFieldPinning`, `IssueTypeFieldAssociation`.
It excludes `ProjectField`, `CustomPropertyDefinition`, `Label`, `IssueFieldValue`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationReference` (synchronous)
- `organizations/organization-policies::IssueSchemaPolicy` (synchronous)
- `commerce/entitlements::IssueSchemaEntitlement` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `IssueTypeDefined@1` (domain, planned): issue type defined. contract and ordering pending activation.
- `IssueTypeUpdated@1` (domain, planned): issue type updated. contract and ordering pending activation.
- `IssueTypeRetired@1` (domain, planned): issue type retired. contract and ordering pending activation.
- `IssueFieldDefined@1` (domain, planned): issue field defined. contract and ordering pending activation.
- `IssueFieldUpdated@1` (domain, planned): issue field updated. contract and ordering pending activation.
- `IssueFieldRetired@1` (domain, planned): issue field retired. contract and ordering pending activation.

## Official sources

- `collaboration-issue-schema-source-01`: [organization issue fields, field visibility, field pinning, type-field associations](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-fields-in-your-organization) (verified 2026-07-22)
- `collaboration-issue-schema-source-02`: [organization issue types, issue type lifecycle](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-types-in-an-organization) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
