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

## Ubiquitous language

The catalog reserves these terms for this context:

- `Project`
- `ProjectItem`
- `DraftIssue`
- `ProjectView`
- `ProjectField`
- `ProjectWorkflow`
- `ProjectChart`
- `ProjectTemplate`
- `ProjectStatusUpdate`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `Project`, `ProjectItem`, `DraftIssue`, `ProjectView`, `ProjectField`, `ProjectWorkflow`, `ProjectChart`, `ProjectTemplate`, `ProjectStatusUpdate`.
It excludes `RepositoryOwnership`, `Issue`, `IssueFieldDefinition`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::UserProjectOwner` (synchronous)
- `organizations/organizations::OrganizationProjectOwner` (synchronous)
- `organizations/organization-policies::ProjectPolicy` (synchronous)
- `collaboration/issues::IssueProjectItem` (synchronous)
- `commerce/entitlements::ProjectEntitlement` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `ProjectCreated@1` (domain, planned): project created. contract and ordering pending activation.
- `ProjectUpdated@1` (domain, planned): project updated. contract and ordering pending activation.
- `ProjectClosed@1` (domain, planned): project closed. contract and ordering pending activation.
- `ProjectReopened@1` (domain, planned): project reopened. contract and ordering pending activation.
- `ProjectDeleted@1` (domain, planned): project deleted. contract and ordering pending activation.
- `ProjectItemAdded@1` (domain, planned): project item added. contract and ordering pending activation.
- `ProjectItemUpdated@1` (domain, planned): project item updated. contract and ordering pending activation.
- `ProjectItemRemoved@1` (domain, planned): project item removed. contract and ordering pending activation.
- `ProjectViewChanged@1` (domain, planned): project view changed. contract and ordering pending activation.
- `ProjectFieldChanged@1` (domain, planned): project field changed. contract and ordering pending activation.
- `ProjectWorkflowChanged@1` (domain, planned): project workflow changed. contract and ordering pending activation.
- `ProjectStatusUpdated@1` (domain, planned): project status updated. contract and ordering pending activation.

## Official sources

- `collaboration-projects-source-01`: [projects, views, fields, workflows, charts, templates](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
