# Projects Bounded Context

- **Catalog path:** `collaboration/projects`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

User- or organization-owned projects, items, draft issues, views, fields, workflows, charts, templates, and status updates.

## Context content tree

- `collaboration/projects` [planned]
  - Purpose: User- or organization-owned projects, items, draft issues, views, fields, workflows, charts, templates, and status updates.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `Project`
    - `ProjectItem`
    - `DraftIssue`
    - `ProjectView`
    - `ProjectField`
    - `ProjectWorkflow`
    - `ProjectChart`
    - `ProjectTemplate`
    - `ProjectStatusUpdate`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `ProjectCreated@1` [planned]: project created.
    - `ProjectUpdated@1` [planned]: project updated.
    - `ProjectClosed@1` [planned]: project closed.
    - `ProjectReopened@1` [planned]: project reopened.
    - `ProjectDeleted@1` [planned]: project deleted.
    - `ProjectItemAdded@1` [planned]: project item added.
    - `ProjectItemUpdated@1` [planned]: project item updated.
    - `ProjectItemRemoved@1` [planned]: project item removed.
    - `ProjectViewChanged@1` [planned]: project view changed.
    - `ProjectFieldChanged@1` [planned]: project field changed.
    - `ProjectWorkflowChanged@1` [planned]: project workflow changed.
    - `ProjectStatusUpdated@1` [planned]: project status updated.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::UserProjectOwner` (synchronous)
    - `organizations/organizations::OrganizationProjectOwner` (synchronous)
    - `organizations/organization-policies::ProjectPolicy` (synchronous)
    - `collaboration/issues::IssueProjectItem` (synchronous)
    - `commerce/entitlements::ProjectEntitlement` (synchronous)
- Explicit exclusions
  - `RepositoryOwnership`
  - `Issue`
  - `IssueFieldDefinition`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `Project`, `ProjectItem`, `DraftIssue`, `ProjectView`, `ProjectField`, `ProjectWorkflow`, `ProjectChart`, `ProjectTemplate`, `ProjectStatusUpdate`.
It excludes `RepositoryOwnership`, `Issue`, `IssueFieldDefinition`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::UserProjectOwner` (synchronous)
- `organizations/organizations::OrganizationProjectOwner` (synchronous)
- `organizations/organization-policies::ProjectPolicy` (synchronous)
- `collaboration/issues::IssueProjectItem` (synchronous)
- `commerce/entitlements::ProjectEntitlement` (synchronous)

## Official sources

- `collaboration-projects-source-01`: [projects, views, fields, workflows, charts, templates](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
