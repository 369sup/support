# Custom Properties Bounded Context

- **Catalog path:** `organizations/custom-properties`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

Organization-defined repository custom-property schemas and repository property values from organization or enterprise definitions.

## Context content tree

- `organizations/custom-properties` [planned]
  - Purpose: Organization-defined repository custom-property schemas and repository property values from organization or enterprise definitions.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `OrganizationRepositoryPropertyDefinition`
    - `OrganizationRepositoryPropertyAllowedValue`
    - `RepositoryPropertyValue`
    - `RepositoryPropertyValueSource`
    - `RequiredRepositoryPropertyPolicy`
    - `ExplicitRepositoryPropertyRequirement`
    - `OrganizationRepositoryPropertyPromotionRequest`
  - Business rules and invariants
    - `organization-repository-property-schema`: Organizations define repository property schemas, allowed values, defaults, and explicit requirements.
    - `organization-repository-property-values`: Repositories hold property values and the source of each assigned value.
  - Published events
    - `OrganizationRepositoryPropertyDefined@1` [planned]: organization-defined repository property created.
    - `OrganizationRepositoryPropertyUpdated@1` [planned]: organization-defined repository property updated.
    - `OrganizationRepositoryPropertyDeleted@1` [planned]: organization-defined repository property deleted.
    - `OrganizationRepositoryPropertyPromotionRequested@1` [planned]: organization repository property submitted for enterprise promotion.
    - `RepositoryPropertyValueSet@1` [planned]: repository property value set.
    - `RepositoryPropertyValueCleared@1` [planned]: repository property value cleared.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `enterprises/custom-properties::EnterpriseRepositoryPropertyDefinition` (synchronous)
    - `repositories/repositories::RepositoryLifecycleState` (synchronous)
    - `repositories/repositories::RepositoryTransferEvents` (event; events `RepositoryTransferred@1`)
    - `enterprises/custom-properties::EnterprisePropertyPromotionEvents` (event; events `EnterpriseRepositoryPropertyPromoted@1`)
- Explicit exclusions
  - `EnterprisePropertyDefinition`
  - `OrganizationPropertyValue`
  - `RepositoryTopic`
  - `ProjectField`
  - `IssueField`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `OrganizationRepositoryPropertyDefinition`, `OrganizationRepositoryPropertyAllowedValue`, `RepositoryPropertyValue`, `RepositoryPropertyValueSource`, `RequiredRepositoryPropertyPolicy`, `ExplicitRepositoryPropertyRequirement`, `OrganizationRepositoryPropertyPromotionRequest`.
It excludes `EnterprisePropertyDefinition`, `OrganizationPropertyValue`, `RepositoryTopic`, `ProjectField`, `IssueField`.

- `organization-repository-property-schema`: Organizations define repository property schemas, allowed values, defaults, and explicit requirements.
  - Ownership: `OrganizationRepositoryPropertyDefinition`, `OrganizationRepositoryPropertyAllowedValue`, `RequiredRepositoryPropertyPolicy`, `ExplicitRepositoryPropertyRequirement`, `OrganizationRepositoryPropertyPromotionRequest`
  - Events: `OrganizationRepositoryPropertyDefined@1`, `OrganizationRepositoryPropertyUpdated@1`, `OrganizationRepositoryPropertyDeleted@1`, `OrganizationRepositoryPropertyPromotionRequested@1`
  - Sources: `organizations-custom-properties-source-01`
- `organization-repository-property-values`: Repositories hold property values and the source of each assigned value.
  - Ownership: `RepositoryPropertyValue`, `RepositoryPropertyValueSource`
  - Events: `RepositoryPropertyValueSet@1`, `RepositoryPropertyValueCleared@1`
  - Sources: `organizations-custom-properties-source-01`

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationReference` (synchronous)
- `enterprises/custom-properties::EnterpriseRepositoryPropertyDefinition` (synchronous)
- `repositories/repositories::RepositoryLifecycleState` (synchronous)
- `repositories/repositories::RepositoryTransferEvents` (event; events `RepositoryTransferred@1`)
- `enterprises/custom-properties::EnterprisePropertyPromotionEvents` (event; events `EnterpriseRepositoryPropertyPromoted@1`)

## Official sources

- `organizations-custom-properties-source-01`: [organization-defined repository property definitions, repository property values, required defaults and explicit values](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
