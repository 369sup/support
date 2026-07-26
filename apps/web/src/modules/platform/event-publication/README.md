# Event Publication Bounded Context

- **Catalog path:** `platform/event-publication`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `not-applicable`

## Purpose

Dispatch committed, context-owned event envelopes with leasing, retry,
operational idempotency, redelivery, and dead-letter handling.

## Context content tree

- `platform/event-publication` [active]
  - Purpose: Dispatch committed, context-owned event envelopes.
  - Capabilities
    - `publish-pending-events` [active]
    - `list-dead-letters` [active]
    - `redeliver-dead-letter` [active]
    - `get-publication-metrics` [active]
    - `register-event-source` [active]
  - Owned domain concepts
    - `PublicationLease`
    - `PublicationCursor`
    - `PublicationAttempt`
    - `DeadLetterRecord`
    - `RedeliveryRequest`
  - Business rules and invariants
    - Source contexts own and commit their outbox records.
    - Delivery receipts make successful publication idempotent.
    - Three consecutive delivery failures move an envelope to dead letter.
    - Publication failure never rolls back the source command.
    - Operational views never expose event payloads.
  - Published events
    - `IntegrationEventPublished@1` [planned]: integration event published.
    - `EventPublicationFailed@1` [planned]: event publication failed.
    - `EventDeadLettered@1` [planned]: event dead lettered.
    - `EventRedelivered@1` [planned]: event redelivered.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships: none.
- Explicit exclusions
  - `ProductEventMeaning`
  - `ContextOutboxRecord`
  - `SourceContextTransaction`
  - `WebhookSubscription`
  - `NotificationInterest`

## Designed use cases

### `publish-pending-events` [active]

- **Type:** `command`
- **Application boundary:** `PublishPendingEventsUseCase.publishPendingEvents()`
- **Public entrypoint:** `server-api.ts#publishPendingEvents`
- **Input:** Optional registered source ID and a bounded batch size.
- **Success result:** Counts for delivered, retried, dead-lettered, and duplicate envelopes.
- **Expected rejections:** `source-not-found`
- **Authorization:** Internal runtime orchestration only.
- **Transaction:** Publication state changes independently after the source transaction.
- **Idempotency:** A recorded event receipt suppresses duplicate delivery.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Delivery is simulated in the current runtime and payloads are not logged.

### `list-dead-letters` [active]

- **Type:** `query`
- **Application boundary:** `ListDeadLettersUseCase.listDeadLetters()`
- **Public entrypoint:** `server-api.ts#listDeadLetters`
- **Input:** Optional source context filter.
- **Success result:** Payload-free dead-letter metadata.
- **Expected rejections:** `none`
- **Authorization:** Internal administration only.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Payloads are deliberately excluded from the inspector.

### `redeliver-dead-letter` [active]

- **Type:** `command`
- **Application boundary:** `RedeliverDeadLetterUseCase.redeliverDeadLetter()`
- **Public entrypoint:** `server-api.ts#redeliverDeadLetter`
- **Input:** Dead-letter ID.
- **Success result:** Delivered or failed redelivery outcome.
- **Expected rejections:** `dead-letter-not-found`
- **Authorization:** Internal administration only.
- **Transaction:** One publication-state transaction.
- **Idempotency:** Successful redelivery records a receipt before removing the dead letter.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Failed redelivery retains the dead letter with an incremented version.

### `get-publication-metrics` [active]

- **Type:** `query`
- **Application boundary:** `GetPublicationMetricsUseCase.getPublicationMetrics()`
- **Public entrypoint:** `server-api.ts#getPublicationMetrics`
- **Input:** None.
- **Success result:** Aggregate attempt, retry, dead-letter, receipt, and oldest-pending-lag metrics.
- **Expected rejections:** `none`
- **Authorization:** Internal observability only.
- **Transaction:** Read-only aggregation.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Metrics contain counts and timestamps only, never payload or personal data.

### `register-event-source` [active]

- **Type:** `command`
- **Application boundary:** `RegisterEventSourceUseCase.registerEventSource()`
- **Public entrypoint:** `server-api.ts#registerEventSource`
- **Input:** A source-owned `CommittedEventSourcePort`.
- **Success result:** The source is registered by its stable source ID.
- **Expected rejections:** `none`
- **Authorization:** Internal composition only; no browser transport is active.
- **Transaction:** Replaces the registry reference atomically in process memory.
- **Idempotency:** Re-registering the same source ID replaces the prior reference.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Registration never transfers ownership of the source outbox.

## Ubiquitous language

- **Committed event source:** Public source-context boundary that leases
  envelopes after the source transaction commits.
- **Receipt:** Idempotency record proving successful delivery for one event ID.
- **Dead letter:** Payload-retaining internal record for an envelope that
  exhausted automatic retries.
- **Operational view:** Payload-free metadata safe for administration and
  observability.

## Ownership and invariants

This context owns publication leases, attempts, receipts, dead letters, and
redelivery state. Source contexts retain ownership of outbox records and
product-event meaning. Delivery is at-least-once until a receipt exists.

## Public capabilities

- `publish-pending-events`
- `list-dead-letters`
- `redeliver-dead-letter`
- `get-publication-metrics`
- `register-event-source`
- `DomainEventEnvelope`
- `EventRecorderPort`
- `CommittedEventSourcePort`

## Dependencies and consistency

The context has no product-context dependency. Sources register a public
`CommittedEventSourcePort`; source storage remains private. Delivery and source
acknowledgement are eventually consistent and idempotent by event ID.

## Authorization

Publication operations are internal runtime and administration capabilities.
No browser route is active in this slice.

## Persistence and transactions

Publication attempts, receipts, and dead letters use a versioned process-local
store. Source outboxes are separate stores committed with their source
commands. Publication is never part of the source transaction.

## Data classification

Event payloads can contain product data and remain internal. The dead-letter
list and metrics expose metadata only.

## Retention and erasure

Successful receipts are retained for the process lifetime to suppress
duplicates. Dead-letter payloads are retained until successful redelivery or
scenario reset. Durable retention and erasure schedules remain deferred.

## Events and failure behavior

The active slice transports source events but does not yet publish its own
operational events. The cataloged publication events remain planned. Delivery
failure is retried up to three attempts and then retained as a dead letter.

## Exceptions

The in-memory adapter is process-local, restart-invalidated, non-durable, and
not horizontally consistent. The simulated delivery adapter performs no
external I/O.

## Official sources

Not applicable; this is a technical capability governed by
[ADR-0003](../../../../../../docs/architecture/decisions/ADR-0003-in-memory-event-and-policy-runtime.md).
