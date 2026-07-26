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

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `Issue`, `SubIssueRelation`, `IssueDependency`, `IssueTransfer`, `IssueTypeSelection`, `IssueFieldValueSet`.
It excludes `Comment`, `LabelDefinition`, `Project`, `PullRequest`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

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

## Official sources

- `collaboration-issues-source-01`: [issues, sub-issues, issue dependencies, issue metadata](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues) (verified 2026-07-22)
- `collaboration-issues-source-02`: [issue field values, issue field value permissions](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-and-managing-issue-fields) (verified 2026-07-22)
- `collaboration-issues-source-03`: [assignee reconciliation, issue type reconciliation](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
