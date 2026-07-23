# Custom Properties Bounded Context

- **Catalog path:** `enterprises/custom-properties`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

Enterprise-defined repository and organization custom-property schemas, organization values, and promotion of organization repository properties.

## Context content tree

- `enterprises/custom-properties` [planned]
  - Purpose: Enterprise-defined repository and organization custom-property schemas, organization values, and promotion of organization repository properties.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `EnterpriseRepositoryPropertyDefinition`
    - `EnterpriseOrganizationPropertyDefinition`
    - `EnterprisePropertyDefault`
    - `EnterprisePropertyEditPolicy`
    - `OrganizationPropertyValue`
    - `EnterpriseRepositoryPropertyPromotion`
  - Business rules and invariants
    - `enterprise-repository-properties`: Enterprises define repository properties, defaults, edit policies, and promotion behavior.
    - `enterprise-organization-properties`: Enterprises define organization properties and organizations hold their assigned values.
  - Published events
    - `EnterpriseRepositoryPropertyDefined@1` [planned]: enterprise repository property defined.
    - `EnterpriseRepositoryPropertyUpdated@1` [planned]: enterprise repository property updated.
    - `EnterpriseRepositoryPropertyDeleted@1` [planned]: enterprise repository property deleted.
    - `EnterpriseRepositoryPropertyPromoted@1` [planned]: organization repository property promoted to enterprise authority.
    - `EnterpriseOrganizationPropertyDefined@1` [planned]: enterprise organization property defined.
    - `EnterpriseOrganizationPropertyUpdated@1` [planned]: enterprise organization property updated.
    - `EnterpriseOrganizationPropertyDeleted@1` [planned]: enterprise organization property deleted.
    - `OrganizationPropertyValueSet@1` [planned]: organization property value set.
    - `OrganizationPropertyValueCleared@1` [planned]: organization property value cleared.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `enterprises/enterprises::EnterpriseReference` (synchronous)
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `organizations/custom-properties::OrganizationPropertyPromotionRequests` (event; events `OrganizationRepositoryPropertyPromotionRequested@1`)
- Explicit exclusions
  - `OrganizationRepositoryPropertyDefinition`
  - `RepositoryPropertyValue`
  - `RepositoryTopic`
  - `IssueField`

## Ubiquitous language

The catalog reserves these terms for this context:

- `EnterpriseRepositoryPropertyDefinition`
- `EnterpriseOrganizationPropertyDefinition`
- `EnterprisePropertyDefault`
- `EnterprisePropertyEditPolicy`
- `OrganizationPropertyValue`
- `EnterpriseRepositoryPropertyPromotion`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `EnterpriseRepositoryPropertyDefinition`, `EnterpriseOrganizationPropertyDefinition`, `EnterprisePropertyDefault`, `EnterprisePropertyEditPolicy`, `OrganizationPropertyValue`, `EnterpriseRepositoryPropertyPromotion`.
It excludes `OrganizationRepositoryPropertyDefinition`, `RepositoryPropertyValue`, `RepositoryTopic`, `IssueField`.

- `enterprise-repository-properties`: Enterprises define repository properties, defaults, edit policies, and promotion behavior.
  - Ownership: `EnterpriseRepositoryPropertyDefinition`, `EnterprisePropertyDefault`, `EnterprisePropertyEditPolicy`, `EnterpriseRepositoryPropertyPromotion`
  - Events: `EnterpriseRepositoryPropertyDefined@1`, `EnterpriseRepositoryPropertyUpdated@1`, `EnterpriseRepositoryPropertyDeleted@1`, `EnterpriseRepositoryPropertyPromoted@1`
  - Sources: `enterprises-custom-properties-source-01`
- `enterprise-organization-properties`: Enterprises define organization properties and organizations hold their assigned values.
  - Ownership: `EnterpriseOrganizationPropertyDefinition`, `OrganizationPropertyValue`
  - Events: `EnterpriseOrganizationPropertyDefined@1`, `EnterpriseOrganizationPropertyUpdated@1`, `EnterpriseOrganizationPropertyDeleted@1`, `OrganizationPropertyValueSet@1`, `OrganizationPropertyValueCleared@1`
  - Sources: `enterprises-custom-properties-source-02`

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)
- `organizations/organizations::OrganizationReference` (synchronous)
- `organizations/custom-properties::OrganizationPropertyPromotionRequests` (event; events `OrganizationRepositoryPropertyPromotionRequested@1`)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `EnterpriseRepositoryPropertyDefined@1` (domain, planned): enterprise repository property defined. contract and ordering pending activation.
- `EnterpriseRepositoryPropertyUpdated@1` (domain, planned): enterprise repository property updated. contract and ordering pending activation.
- `EnterpriseRepositoryPropertyDeleted@1` (domain, planned): enterprise repository property deleted. contract and ordering pending activation.
- `EnterpriseRepositoryPropertyPromoted@1` (domain, planned): organization repository property promoted to enterprise authority. contract and ordering pending activation.
- `EnterpriseOrganizationPropertyDefined@1` (domain, planned): enterprise organization property defined. contract and ordering pending activation.
- `EnterpriseOrganizationPropertyUpdated@1` (domain, planned): enterprise organization property updated. contract and ordering pending activation.
- `EnterpriseOrganizationPropertyDeleted@1` (domain, planned): enterprise organization property deleted. contract and ordering pending activation.
- `OrganizationPropertyValueSet@1` (domain, planned): organization property value set. contract and ordering pending activation.
- `OrganizationPropertyValueCleared@1` (domain, planned): organization property value cleared. contract and ordering pending activation.

## Official sources

- `enterprises-custom-properties-source-01`: [enterprise-defined repository properties, enterprise defaults and edit policy, organization property promotion](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-repositories-in-your-enterprise/managing-custom-properties-for-repositories-in-your-enterprise) (verified 2026-07-22)
- `enterprises-custom-properties-source-02`: [enterprise-defined organization properties, organization property values, organization property defaults](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-organizations-in-your-enterprise/managing-custom-properties-for-organizations) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
