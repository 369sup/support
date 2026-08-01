# Notification Channels Bounded Context

- **Catalog path:** `platform/notification-channels`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `not-applicable`

## Purpose

External email or push delivery adapters for accepted notification delivery requests.

## Context content tree

- `platform/notification-channels` [planned]
  - Purpose: External email or push delivery adapters for accepted notification delivery requests.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `ChannelDelivery`
    - `DeliveryAttempt`
    - `DeliveryProviderReference`
  - Business rules and invariants
    - Product-semantic claims are not applicable to this technical context.
  - Published events
    - `ChannelDeliverySucceeded@1` [planned]: channel delivery succeeded.
    - `ChannelDeliveryFailed@1` [planned]: channel delivery failed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `engagement/notifications::NotificationDeliveryRequests` (event; events `NotificationDeliveryRequested@1`)
- Explicit exclusions
  - `Notification`
  - `SubscriptionPreference`
  - `RecipientSelection`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `ChannelDelivery`, `DeliveryAttempt`, `DeliveryProviderReference`.
It excludes `Notification`, `SubscriptionPreference`, `RecipientSelection`.

Product-semantic claims are not applicable to this technical context.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `engagement/notifications::NotificationDeliveryRequests` (event; events `NotificationDeliveryRequested@1`)

## Official sources

Not applicable to this technical context.

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
