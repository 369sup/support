# Activity Feed

## Purpose

Project supported, permission-filtered non-code product activity.

## Context content tree

- Repository activity [active]
  - `list-repository-activity`
  - Owned: `ActivityItem`, `RepositoryActivityFeed`
- Personal and organization activity [planned]
  - Owned: `PersonalActivityFeed`, `OrganizationActivityFeed`
- Published events: none; this is a read model.
- Runtime dependencies: none.
- Excludes: `AuditEvent`, `DomainEventSource`, `CodeActivity`.

## Designed use cases

### `list-repository-activity` [active]

- **Type:** `query`
- **Application boundary:** `ListRepositoryActivityUseCase.listRepositoryActivity()`
- **Public entrypoint:** `server-api.ts#listRepositoryActivity`
- **Input:** Repository ID.
- **Success result:** `found` with supported activity newest first.
- **Expected rejections:** `invalid-repository-id`
- **Authorization:** Delivery establishes repository read access.
- **Transaction:** Read-only projection snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `projections-activity-feed-source-01`
- **Local policy:** Active kinds are issue opened, comment added, and repository starred; code activity is excluded.

## Ubiquitous language

- **Activity item**: projected supported product fact with actor, target, and time.
- **Repository feed**: activity items scoped to one readable repository.

## Ownership and invariants

Owns all catalog feed projections. It never becomes source-of-truth for events.

## Public capabilities

`listRepositoryActivity`.

## Dependencies and consistency

The first slice uses deterministic fixtures. Event-driven projection remains
planned, so new commands do not claim immediate feed publication.

## Authorization

Delivery resolves effective repository read permission before querying.

## Persistence and transactions

Read-only process fixtures.

## Data classification

Activity inherits source resource visibility and must be permission-filtered.

## Retention and erasure

Process lifetime only.

## Events and failure behavior

No events are published. Invalid input is a discriminated value.

## Official sources

- <https://docs.github.com/en/account-and-profile/reference/personal-dashboard>

## Exceptions

None.
