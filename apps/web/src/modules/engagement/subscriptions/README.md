# Subscriptions

## Purpose

Own repository watch preferences and future conversation subscription rules.

## Context content tree

- Repository watch [active]
  - `toggle-repository-subscription`
  - `list-repository-subscribers`
  - Owned: `RepositoryWatchPreference`
- Custom and conversation preferences [planned]
  - Owned: `RepositoryEventPreference`, `ConversationParticipation`,
    `ManualConversationSubscription`, `IgnorePreference`
- Planned events: `RepositorySubscriptionChanged@1`,
  `ConversationSubscriptionChanged@1`
- Runtime dependencies: none.
- Excludes: `Notification`, `NotificationReason`, `EmailDelivery`,
  `RepositoryStar`.

## Designed use cases

### `toggle-repository-subscription` [active]

- **Type:** `command`
- **Application boundary:** `ToggleRepositorySubscriptionUseCase.toggleRepositorySubscription()`
- **Public entrypoint:** `server-api.ts#toggleRepositorySubscription`
- **Input:** Repository ID, actor account ID and username, and timestamp.
- **Success result:** `updated` with current subscription state.
- **Expected rejections:** `invalid-subscription`
- **Authorization:** Delivery establishes authenticated repository read access.
- **Transaction:** Add or remove one process-local watch preference.
- **Idempotency:** Not idempotent; each call toggles.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `engagement-subscriptions-source-01`
- **Local policy:** Active slice watches all supported non-code activity.

### `list-repository-subscribers` [active]

- **Type:** `query`
- **Application boundary:** `ListRepositorySubscribersUseCase.listRepositorySubscribers()`
- **Public entrypoint:** `server-api.ts#listRepositorySubscribers`
- **Input:** Repository ID.
- **Success result:** `found` with visible subscribers.
- **Expected rejections:** `invalid-repository-id`
- **Authorization:** Delivery establishes repository read access.
- **Transaction:** Read-only snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `engagement-subscriptions-source-01`
- **Local policy:** No inaccessible repository relation is exposed.

## Ubiquitous language

- **Repository watch**: preference for repository activity notifications.
- **Subscriber**: account with an active repository watch.

## Ownership and invariants

Owns all catalog subscription preferences. One account has at most one watch
preference per repository.

## Public capabilities

`toggleRepositorySubscription` and `listRepositorySubscribers`.

## Dependencies and consistency

Delivery resolves repository access; notification interest consumption remains planned.

## Authorization

Only the authenticated actor mutates its own watch.

## Persistence and transactions

Watches are process-local and non-durable.

## Data classification

Subscription relations are engagement preference data.

## Retention and erasure

Process lifetime only; visibility cleanup remains planned.

## Events and failure behavior

Events remain planned until transactional publication exists.

## Official sources

- <https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications>
- <https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications>
- <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility>

## Exceptions

None.
