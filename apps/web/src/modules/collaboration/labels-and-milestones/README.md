# Labels And Milestones Bounded Context

- **Catalog path:** `collaboration/labels-and-milestones`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Repository-scoped labels, milestones, and work classification.

## Context content tree

- `collaboration/labels-and-milestones` [planned]
  - Purpose: Repository-scoped labels, milestones, and work classification.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `LabelCatalog`
    - `Label`
    - `Milestone`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `LabelCreated@1` [planned]: label created.
    - `LabelUpdated@1` [planned]: label updated.
    - `LabelDeleted@1` [planned]: label deleted.
    - `MilestoneCreated@1` [planned]: milestone created.
    - `MilestoneUpdated@1` [planned]: milestone updated.
    - `MilestoneClosed@1` [planned]: milestone closed.
    - `MilestoneReopened@1` [planned]: milestone reopened.
    - `MilestoneDeleted@1` [planned]: milestone deleted.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `repositories/repositories::RepositoryLifecycleState` (synchronous)
- Explicit exclusions
  - `Issue`
  - `Discussion`
  - `OrganizationDefaultLabelPolicy`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `LabelCatalog`, `Label`, `Milestone`.
It excludes `Issue`, `Discussion`, `OrganizationDefaultLabelPolicy`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `repositories/repositories::RepositoryLifecycleState` (synchronous)

## Official sources

- `collaboration-labels-and-milestones-source-01`: [labels, milestones, work classification](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
