# Issues Bounded Context

- **Catalog path:** `collaboration/issues`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Issue lifecycle, assignment, hierarchy, dependency, transfer, and work tracking.

## Context content tree

- `collaboration/issues` [planned]
  - Purpose: Issue lifecycle, assignment, hierarchy, dependency, transfer, and work tracking.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `Issue`
    - `SubIssueRelation`
    - `IssueDependency`
    - `IssueTransfer`
    - `IssueTypeSelection`
    - `IssueFieldValueSet`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `IssueCreated@1` [planned]: issue created.
    - `IssueUpdated@1` [planned]: issue updated.
    - `IssueClosed@1` [planned]: issue closed.
    - `IssueReopened@1` [planned]: issue reopened.
    - `IssueAssigned@1` [planned]: issue assigned.
    - `IssueUnassigned@1` [planned]: issue unassigned.
    - `SubIssueAdded@1` [planned]: sub issue added.
    - `SubIssueRemoved@1` [planned]: sub issue removed.
    - `IssueDependencyAdded@1` [planned]: issue dependency added.
    - `IssueDependencyRemoved@1` [planned]: issue dependency removed.
    - `IssueTransferred@1` [planned]: issue transferred.
    - `IssueFieldValueSet@1` [planned]: issue field value set.
    - `IssueFieldValueCleared@1` [planned]: issue field value cleared.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `repositories/repositories::RepositoryLifecycleState` (synchronous)
    - `repositories/repository-access::RepositoryPermission` (synchronous)
    - `repositories/repository-features::IssueFeatureState` (synchronous)
    - `collaboration/issue-schema::IssueSchemaReference` (synchronous)
    - `collaboration/labels-and-milestones::TaxonomyReference` (synchronous)
    - `collaboration/conversations::IssueConversation` (synchronous)
    - `repositories/repositories::RepositoryTransferEvents` (event; events `RepositoryTransferred@1`)
- Explicit exclusions
  - `Comment`
  - `LabelDefinition`
  - `Project`
  - `PullRequest`

## Ubiquitous language

The catalog reserves these terms for this context:

- `Issue`
- `SubIssueRelation`
- `IssueDependency`
- `IssueTransfer`
- `IssueTypeSelection`
- `IssueFieldValueSet`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `Issue`, `SubIssueRelation`, `IssueDependency`, `IssueTransfer`, `IssueTypeSelection`, `IssueFieldValueSet`.
It excludes `Comment`, `LabelDefinition`, `Project`, `PullRequest`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `repositories/repositories::RepositoryLifecycleState` (synchronous)
- `repositories/repository-access::RepositoryPermission` (synchronous)
- `repositories/repository-features::IssueFeatureState` (synchronous)
- `collaboration/issue-schema::IssueSchemaReference` (synchronous)
- `collaboration/labels-and-milestones::TaxonomyReference` (synchronous)
- `collaboration/conversations::IssueConversation` (synchronous)
- `repositories/repositories::RepositoryTransferEvents` (event; events `RepositoryTransferred@1`)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `IssueCreated@1` (domain, planned): issue created. contract and ordering pending activation.
- `IssueUpdated@1` (domain, planned): issue updated. contract and ordering pending activation.
- `IssueClosed@1` (domain, planned): issue closed. contract and ordering pending activation.
- `IssueReopened@1` (domain, planned): issue reopened. contract and ordering pending activation.
- `IssueAssigned@1` (domain, planned): issue assigned. contract and ordering pending activation.
- `IssueUnassigned@1` (domain, planned): issue unassigned. contract and ordering pending activation.
- `SubIssueAdded@1` (domain, planned): sub issue added. contract and ordering pending activation.
- `SubIssueRemoved@1` (domain, planned): sub issue removed. contract and ordering pending activation.
- `IssueDependencyAdded@1` (domain, planned): issue dependency added. contract and ordering pending activation.
- `IssueDependencyRemoved@1` (domain, planned): issue dependency removed. contract and ordering pending activation.
- `IssueTransferred@1` (domain, planned): issue transferred. contract and ordering pending activation.
- `IssueFieldValueSet@1` (domain, planned): issue field value set. contract and ordering pending activation.
- `IssueFieldValueCleared@1` (domain, planned): issue field value cleared. contract and ordering pending activation.

## Official sources

- `collaboration-issues-source-01`: [issues, sub-issues, issue dependencies, issue metadata](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues) (verified 2026-07-22)
- `collaboration-issues-source-02`: [issue field values, issue field value permissions](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-and-managing-issue-fields) (verified 2026-07-22)
- `collaboration-issues-source-03`: [assignee reconciliation, issue type reconciliation](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
