# Issues

## Purpose

Own repository issue work tracking. The active slice lists, reads, and creates
issues after delivery has established repository visibility.

## Context content tree

- Issue work tracking [active]
  - `list-repository-issues`
  - `get-repository-issue`
  - `create-issue`
  - Owned: `Issue`
- Advanced issue structure [planned]
  - Owned: `SubIssueRelation`, `IssueDependency`, `IssueTransfer`,
    `IssueTypeSelection`, `IssueFieldValueSet`
- Planned events
  - `IssueCreated@1`, `IssueUpdated@1`, `IssueClosed@1`, `IssueReopened@1`,
    `IssueAssigned@1`, `IssueUnassigned@1`, `SubIssueAdded@1`,
    `SubIssueRemoved@1`, `IssueDependencyAdded@1`,
    `IssueDependencyRemoved@1`, `IssueTransferred@1`,
    `IssueFieldValueSet@1`, `IssueFieldValueCleared@1`
- Runtime dependencies: none.
- Explicit exclusions: `Comment`, `LabelDefinition`, `Project`, `PullRequest`.

## Designed use cases

### `list-repository-issues` [active]

- **Type:** `query`
- **Application boundary:** `ListRepositoryIssuesUseCase.listRepositoryIssues()`
- **Public entrypoint:** `server-api.ts#listRepositoryIssues`
- **Input:** Repository ID and optional `open` or `closed` state.
- **Success result:** Ordered issue summaries for that repository.
- **Expected rejections:** `invalid-repository-id`
- **Authorization:** Delivery must establish repository read access; this context filters only by repository ID.
- **Transaction:** Read-only query over the context-owned PostgreSQL store.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-issues-source-01`
- **Local policy:** Sort by issue number descending.

### `get-repository-issue` [active]

- **Type:** `query`
- **Application boundary:** `GetRepositoryIssueUseCase.getRepositoryIssue()`
- **Public entrypoint:** `server-api.ts#getRepositoryIssue`
- **Input:** Repository ID and positive issue number.
- **Success result:** `found` with the issue.
- **Expected rejections:** `invalid-issue-number`, `issue-not-found`
- **Authorization:** Delivery must establish repository read access.
- **Transaction:** Read-only query over the context-owned PostgreSQL store.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-issues-source-01`
- **Local policy:** Repository ID and number form the external lookup key.

### `create-issue` [active]

- **Type:** `command`
- **Application boundary:** `CreateIssueUseCase.createIssue()`
- **Public entrypoint:** `server-api.ts#createIssue`
- **Input:** Repository ID, actor account ID and username, title, body, and ISO timestamp.
- **Success result:** `created` with a new open issue.
- **Expected rejections:** `invalid-issue`
- **Authorization:** Delivery establishes authenticated repository read access; the handler owns issue input invariants.
- **Transaction:** Allocate one repository-scoped number and insert one record.
- **Idempotency:** Not idempotent; each accepted command creates a new issue.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-issues-source-01`
- **Local policy:** Title and body must be non-empty after trimming.

## Ubiquitous language

- **Issue**: repository-scoped actionable work item.
- **Issue number**: monotonically increasing number inside one repository.
- **Issue state**: `open` or `closed`.

## Ownership and invariants

This context owns `Issue`, `SubIssueRelation`, `IssueDependency`,
`IssueTransfer`, `IssueTypeSelection`, and `IssueFieldValueSet`. Active issue
numbers are unique per repository and new issues start open.

## Public capabilities

`listRepositoryIssues`, `getRepositoryIssue`, and `createIssue` are exported by
`server-api.ts` with boundary-safe issue contracts.

## Dependencies and consistency

The active slice has no runtime import dependency. Delivery resolves repository
identity, lifecycle, feature availability, and effective permission before
calling this context. Catalog relationships remain planned.

## Authorization

Repository visibility and effective read permission are established at the
delivery boundary. The issue handler validates issue-owned input only. A future
durable API must move the repository permission contract into the application
boundary before external callers are admitted.

## Persistence and transactions

Production composition uses a context-owned PostgreSQL adapter for
repository-scoped numbering, inserts, and queries. The in-memory adapter
remains an isolated development and test alternative.

## Data classification

Issue title, body, state, author identifiers, and timestamps are repository
collaboration data. Repository permission determines visibility.

## Retention and erasure

Issue records are durable in PostgreSQL. Deletion, transfer, and final
retention policies remain planned.

## Events and failure behavior

All catalog events remain planned until transactional publication exists.
Expected validation and absence are discriminated values.

## Official sources

- <https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues>
- <https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-and-managing-issue-fields>
- <https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository>

## Exceptions

None.
