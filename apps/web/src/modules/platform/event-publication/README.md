# Event Publication Bounded Context

- **Catalog path:** `platform/event-publication`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `not-applicable`

## Purpose

Dispatch, leasing, retry, operational idempotency, redelivery, and dead-letter handling for context-owned event envelopes.

## Context content tree

- `platform/event-publication` [planned]
  - Purpose: Dispatch, leasing, retry, operational idempotency, redelivery, and dead-letter handling for context-owned event envelopes.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `PublicationLease`
    - `PublicationCursor`
    - `PublicationAttempt`
    - `DeadLetterRecord`
    - `RedeliveryRequest`
  - Business rules and invariants
    - Product-semantic claims are not applicable to this technical context.
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

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `PublicationLease`
- `PublicationCursor`
- `PublicationAttempt`
- `DeadLetterRecord`
- `RedeliveryRequest`

Precise definitions must be refined against technical contracts before activation.

## Ownership and invariants

This context owns `PublicationLease`, `PublicationCursor`, `PublicationAttempt`, `DeadLetterRecord`, `RedeliveryRequest`.
It excludes `ProductEventMeaning`, `ContextOutboxRecord`, `SourceContextTransaction`, `WebhookSubscription`, `NotificationInterest`.

Product-semantic claims are not applicable to this technical context.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

No runtime dependency or planned relationship is cataloged.

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `IntegrationEventPublished@1` (technical, planned): integration event published. contract and ordering pending activation.
- `EventPublicationFailed@1` (technical, planned): event publication failed. contract and ordering pending activation.
- `EventDeadLettered@1` (technical, planned): event dead lettered. contract and ordering pending activation.
- `EventRedelivered@1` (technical, planned): event redelivered. contract and ordering pending activation.

## Official sources

Not applicable to this technical context.

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
