# Notification Channels Bounded Context

- **Catalog path:** `platform/notification-channels`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `not-applicable`

## Purpose

Deliver accepted email requests through a provider-neutral, idempotent channel
boundary without deciding notification meaning or recipients.

## Context content tree

- `platform/notification-channels` [active]
  - Email delivery [active]
    - Use case: `deliver-email`
    - Use case: `get-channel-delivery`
    - Owned: `ChannelDelivery`, `DeliveryAttempt`,
      `DeliveryProviderReference`
  - Published events
    - `ChannelDeliverySucceeded@1` [planned]
    - `ChannelDeliveryFailed@1` [planned]
- External relationships
  - Runtime dependencies: none.
  - Planned: `engagement/notifications::NotificationDeliveryRequests`
- Explicit exclusions
  - `Notification`
  - `SubscriptionPreference`
  - `RecipientSelection`

## Designed use cases

### `deliver-email` [active]

- **Type:** `command`
- **Application boundary:** `DeliverEmailUseCase.deliverEmail()`
- **Public entrypoint:** `server-api.ts#deliverEmail`
- **Input:** Idempotency key, recipient address, subject, text, and optional HTML.
- **Success result:** `delivered` or idempotent `already-processed`.
- **Expected rejections:** `invalid-request`, `delivery-failed`
- **Authorization:** Trusted server composition only.
- **Transaction:** Context-local accepted and terminal delivery snapshots.
- **Idempotency:** One delivery per caller-supplied idempotency key.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Attachments, filesystem reads, URL reads, and provider error details are not accepted.

### `get-channel-delivery` [active]

- **Type:** `query`
- **Application boundary:** `GetChannelDeliveryUseCase.getChannelDelivery()`
- **Public entrypoint:** `server-api.ts#getChannelDelivery`
- **Input:** Delivery ID.
- **Success result:** `found` with channel delivery state.
- **Expected rejections:** `invalid-query`, `delivery-not-found`
- **Authorization:** Trusted server composition only.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Provider credentials and raw provider errors are never returned.

## Ubiquitous language

- **Channel delivery:** One accepted external delivery request.
- **Delivery attempt:** One provider invocation.
- **Provider reference:** Opaque provider receipt identifier.

## Ownership and invariants

The context owns technical delivery state. A stable idempotency key identifies
one request, and terminal outcomes are retained for safe retries.

## Public capabilities

`server-api.ts` exposes delivery and delivery-state lookup to trusted server
composition.

## Dependencies and consistency

There are no active bounded-context dependencies. Callers decide message
meaning, recipient selection, and authorization before invoking this context.

## Authorization

No browser route is exposed. Callers are trusted server modules.

## Persistence and transactions

PostgreSQL is the production adapter and an in-memory adapter supports tests and
development. SMTP uses STARTTLS for non-implicit-TLS ports and never relaxes
certificate validation.

## Data classification

Recipient addresses and message content are confidential. SMTP credentials are
deployment secrets and are absent from delivery records.

## Retention and erasure

Delivery metadata is retained until a later operator-owned retention policy.
Callers must avoid unnecessary personal or secret content.

## Events and failure behavior

Provider failures become controlled `delivery-failed` results and persisted
failure codes. Technical success/failure events remain planned.

## Official sources

Not applicable to this technical context.

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json)
remains authoritative.
