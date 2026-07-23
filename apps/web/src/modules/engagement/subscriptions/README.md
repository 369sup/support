# Subscriptions Bounded Context

- **Catalog path:** `engagement/subscriptions`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Repository watch preferences, conversation participation and manual subscriptions, ignore preferences, and notification-interest decisions.

## Context content tree

- `engagement/subscriptions` [planned]
  - Purpose: Repository watch preferences, conversation participation and manual subscriptions, ignore preferences, and notification-interest decisions.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `RepositoryWatchPreference`
    - `RepositoryEventPreference`
    - `ConversationParticipation`
    - `ManualConversationSubscription`
    - `IgnorePreference`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `RepositorySubscriptionChanged@1` [planned]: repository subscription changed.
    - `ConversationSubscriptionChanged@1` [planned]: conversation subscription changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::AccountReference` (synchronous)
    - `repositories/repositories::RepositoryReference` (synchronous)
    - `repositories/repository-access::RepositoryReadPermission` (synchronous)
    - `collaboration/conversations::ConversationReference` (synchronous)
    - `repositories/repositories::RepositoryVisibilityEvents` (event; events `RepositoryVisibilityChanged@1`)
- Explicit exclusions
  - `Notification`
  - `NotificationReason`
  - `EmailDelivery`
  - `RepositoryStar`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `RepositoryWatchPreference`
- `RepositoryEventPreference`
- `ConversationParticipation`
- `ManualConversationSubscription`
- `IgnorePreference`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `RepositoryWatchPreference`, `RepositoryEventPreference`, `ConversationParticipation`, `ManualConversationSubscription`, `IgnorePreference`.
It excludes `Notification`, `NotificationReason`, `EmailDelivery`, `RepositoryStar`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::AccountReference` (synchronous)
- `repositories/repositories::RepositoryReference` (synchronous)
- `repositories/repository-access::RepositoryReadPermission` (synchronous)
- `collaboration/conversations::ConversationReference` (synchronous)
- `repositories/repositories::RepositoryVisibilityEvents` (event; events `RepositoryVisibilityChanged@1`)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `RepositorySubscriptionChanged@1` (domain, planned): repository subscription changed. contract and ordering pending activation.
- `ConversationSubscriptionChanged@1` (domain, planned): conversation subscription changed. contract and ordering pending activation.

## Official sources

- `engagement-subscriptions-source-01`: [repository watches, conversation subscriptions, automatic participation](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications) (verified 2026-07-22)
- `engagement-subscriptions-source-02`: [custom watch preferences, ignore preference](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications) (verified 2026-07-22)
- `engagement-subscriptions-source-03`: [watchers removed by visibility changes](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
