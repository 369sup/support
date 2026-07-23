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

## Ubiquitous language

The catalog reserves these terms for this context:

- `ChannelDelivery`
- `DeliveryAttempt`
- `DeliveryProviderReference`

Precise definitions must be refined against technical contracts before activation.

## Ownership and invariants

This context owns `ChannelDelivery`, `DeliveryAttempt`, `DeliveryProviderReference`.
It excludes `Notification`, `SubscriptionPreference`, `RecipientSelection`.

Product-semantic claims are not applicable to this technical context.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `engagement/notifications::NotificationDeliveryRequests` (event; events `NotificationDeliveryRequested@1`)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `ChannelDeliverySucceeded@1` (technical, planned): channel delivery succeeded. contract and ordering pending activation.
- `ChannelDeliveryFailed@1` (technical, planned): channel delivery failed. contract and ordering pending activation.

## Official sources

Not applicable to this technical context.

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
