# Activity Feed Bounded Context

- **Catalog path:** `projections/activity-feed`
- **Kind:** `projection`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

User-visible dashboard and resource activity projections.

## Context content tree

- `projections/activity-feed` [planned]
  - Purpose: User-visible dashboard and resource activity projections.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `ActivityItem`
    - `PersonalActivityFeed`
    - `RepositoryActivityFeed`
    - `OrganizationActivityFeed`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - None. Read-model context consumes versioned events and does not publish product facts.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/social-graph::FollowEvents` (event; events `UserFollowed@1`, `UserUnfollowed@1`, `OrganizationFollowed@1`, `OrganizationUnfollowed@1`)
    - `repositories/repositories::RepositoryActivityEvents` (event; events `RepositoryCreated@1`, `RepositoryProfileUpdated@1`, `RepositoryRenamed@1`, `RepositoryVisibilityChanged@1`, `RepositoryArchived@1`, `RepositoryUnarchived@1`, `RepositoryDeleted@1`, `RepositoryRestored@1`)
    - `collaboration/issues::IssueActivityEvents` (event; events `IssueCreated@1`, `IssueUpdated@1`, `IssueClosed@1`, `IssueReopened@1`)
    - `collaboration/discussions::DiscussionActivityEvents` (event; events `DiscussionCreated@1`, `DiscussionUpdated@1`, `DiscussionClosed@1`, `DiscussionReopened@1`)
    - `collaboration/projects::ProjectActivityEvents` (event; events `ProjectCreated@1`, `ProjectUpdated@1`, `ProjectClosed@1`, `ProjectReopened@1`, `ProjectStatusUpdated@1`)
    - `repositories/repository-access::EffectiveReadPermission` (synchronous)
- Explicit exclusions
  - `AuditEvent`
  - `DomainEventSource`
  - `CodeActivity`

## Ubiquitous language

The catalog reserves these terms for this context:

- `ActivityItem`
- `PersonalActivityFeed`
- `RepositoryActivityFeed`
- `OrganizationActivityFeed`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `ActivityItem`, `PersonalActivityFeed`, `RepositoryActivityFeed`, `OrganizationActivityFeed`.
It excludes `AuditEvent`, `DomainEventSource`, `CodeActivity`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/social-graph::FollowEvents` (event; events `UserFollowed@1`, `UserUnfollowed@1`, `OrganizationFollowed@1`, `OrganizationUnfollowed@1`)
- `repositories/repositories::RepositoryActivityEvents` (event; events `RepositoryCreated@1`, `RepositoryProfileUpdated@1`, `RepositoryRenamed@1`, `RepositoryVisibilityChanged@1`, `RepositoryArchived@1`, `RepositoryUnarchived@1`, `RepositoryDeleted@1`, `RepositoryRestored@1`)
- `collaboration/issues::IssueActivityEvents` (event; events `IssueCreated@1`, `IssueUpdated@1`, `IssueClosed@1`, `IssueReopened@1`)
- `collaboration/discussions::DiscussionActivityEvents` (event; events `DiscussionCreated@1`, `DiscussionUpdated@1`, `DiscussionClosed@1`, `DiscussionReopened@1`)
- `collaboration/projects::ProjectActivityEvents` (event; events `ProjectCreated@1`, `ProjectUpdated@1`, `ProjectClosed@1`, `ProjectReopened@1`, `ProjectStatusUpdated@1`)
- `repositories/repository-access::EffectiveReadPermission` (synchronous)

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

- `projections-activity-feed-source-01`: [personal dashboard, activity feed, followed activity](https://docs.github.com/en/account-and-profile/concepts/personal-dashboard) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
