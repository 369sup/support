# Search Bounded Context

- **Catalog path:** `projections/search`
- **Kind:** `projection`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Permission-filtered search projections across users, organizations, repositories, issues, discussions, and projects.

## Context content tree

- `projections/search` [planned]
  - Purpose: Permission-filtered search projections across users, organizations, repositories, issues, discussions, and projects.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `SearchDocument`
    - `SearchResultProjection`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - None. Read-model context consumes versioned events and does not publish product facts.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::AccountSearchEvents` (event; events `AccountCreated@1`, `UsernameChanged@1`, `AccountDeleted@1`)
    - `organizations/organizations::OrganizationSearchEvents` (event; events `OrganizationCreated@1`, `OrganizationRenamed@1`, `OrganizationLifecycleChanged@1`)
    - `enterprises/custom-properties::EnterpriseCustomPropertySearchEvents` (event; events `EnterpriseRepositoryPropertyDefined@1`, `EnterpriseRepositoryPropertyUpdated@1`, `EnterpriseRepositoryPropertyDeleted@1`, `EnterpriseRepositoryPropertyPromoted@1`, `EnterpriseOrganizationPropertyDefined@1`, `EnterpriseOrganizationPropertyUpdated@1`, `EnterpriseOrganizationPropertyDeleted@1`, `OrganizationPropertyValueSet@1`, `OrganizationPropertyValueCleared@1`)
    - `organizations/custom-properties::RepositoryCustomPropertySearchEvents` (event; events `OrganizationRepositoryPropertyDefined@1`, `OrganizationRepositoryPropertyUpdated@1`, `OrganizationRepositoryPropertyDeleted@1`, `RepositoryPropertyValueSet@1`, `RepositoryPropertyValueCleared@1`)
    - `repositories/repositories::RepositorySearchEvents` (event; events `RepositoryCreated@1`, `RepositoryRenamed@1`, `RepositoryVisibilityChanged@1`, `RepositoryArchived@1`, `RepositoryUnarchived@1`, `RepositoryDeleted@1`, `RepositoryRestored@1`)
    - `repositories/repository-access::EffectiveReadPermission` (synchronous)
    - `collaboration/issues::IssueSearchEvents` (event; events `IssueCreated@1`, `IssueUpdated@1`, `IssueClosed@1`, `IssueReopened@1`, `IssueTransferred@1`)
    - `collaboration/discussions::DiscussionSearchEvents` (event; events `DiscussionCreated@1`, `DiscussionUpdated@1`, `DiscussionClosed@1`, `DiscussionReopened@1`, `DiscussionTransferred@1`)
    - `collaboration/projects::ProjectSearchEvents` (event; events `ProjectCreated@1`, `ProjectUpdated@1`, `ProjectClosed@1`, `ProjectReopened@1`, `ProjectDeleted@1`)
    - `platform/search-index::SearchIndexPort` (synchronous)
- Explicit exclusions
  - `SourceAggregate`
  - `AuthorizationSourceOfTruth`
  - `CodeSearch`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `SearchDocument`
- `SearchResultProjection`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `SearchDocument`, `SearchResultProjection`.
It excludes `SourceAggregate`, `AuthorizationSourceOfTruth`, `CodeSearch`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::AccountSearchEvents` (event; events `AccountCreated@1`, `UsernameChanged@1`, `AccountDeleted@1`)
- `organizations/organizations::OrganizationSearchEvents` (event; events `OrganizationCreated@1`, `OrganizationRenamed@1`, `OrganizationLifecycleChanged@1`)
- `enterprises/custom-properties::EnterpriseCustomPropertySearchEvents` (event; events `EnterpriseRepositoryPropertyDefined@1`, `EnterpriseRepositoryPropertyUpdated@1`, `EnterpriseRepositoryPropertyDeleted@1`, `EnterpriseRepositoryPropertyPromoted@1`, `EnterpriseOrganizationPropertyDefined@1`, `EnterpriseOrganizationPropertyUpdated@1`, `EnterpriseOrganizationPropertyDeleted@1`, `OrganizationPropertyValueSet@1`, `OrganizationPropertyValueCleared@1`)
- `organizations/custom-properties::RepositoryCustomPropertySearchEvents` (event; events `OrganizationRepositoryPropertyDefined@1`, `OrganizationRepositoryPropertyUpdated@1`, `OrganizationRepositoryPropertyDeleted@1`, `RepositoryPropertyValueSet@1`, `RepositoryPropertyValueCleared@1`)
- `repositories/repositories::RepositorySearchEvents` (event; events `RepositoryCreated@1`, `RepositoryRenamed@1`, `RepositoryVisibilityChanged@1`, `RepositoryArchived@1`, `RepositoryUnarchived@1`, `RepositoryDeleted@1`, `RepositoryRestored@1`)
- `repositories/repository-access::EffectiveReadPermission` (synchronous)
- `collaboration/issues::IssueSearchEvents` (event; events `IssueCreated@1`, `IssueUpdated@1`, `IssueClosed@1`, `IssueReopened@1`, `IssueTransferred@1`)
- `collaboration/discussions::DiscussionSearchEvents` (event; events `DiscussionCreated@1`, `DiscussionUpdated@1`, `DiscussionClosed@1`, `DiscussionReopened@1`, `DiscussionTransferred@1`)
- `collaboration/projects::ProjectSearchEvents` (event; events `ProjectCreated@1`, `ProjectUpdated@1`, `ProjectClosed@1`, `ProjectReopened@1`, `ProjectDeleted@1`)
- `platform/search-index::SearchIndexPort` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- None. Read-model context consumes versioned events and does not publish product facts.

## Official sources

- `projections-search-source-01`: [global search, repository search, issue search, permission-filtered results](https://docs.github.com/en/search-github) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
