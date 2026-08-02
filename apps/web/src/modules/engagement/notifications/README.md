# Notifications

## Purpose

Own recipient-specific notification records and inbox triage.

## Context content tree

- Notification inbox [active]
  - `list-notifications`
  - `mark-notification-read`
  - Owned: `Notification`, `NotificationInbox`, `NotificationReason`,
    `NotificationState`
- Inbox customization [planned]
  - Owned: `InboxFilter`
- Planned events: `NotificationCreated@1`, `NotificationRead@1`,
  `NotificationUnread@1`, `NotificationSaved@1`, `NotificationUnsaved@1`,
  `NotificationDone@1`, `NotificationReopened@1`, `InboxFilterChanged@1`,
  `NotificationDeliveryRequested@1`
- Runtime dependencies: none.
- Excludes: `SubscriptionPreference`, `EmailDelivery`, `PushDelivery`.

## Designed use cases

### `list-notifications` [active]

- **Type:** `query`
- **Application boundary:** `ListNotificationsUseCase.listNotifications()`
- **Public entrypoint:** `server-api.ts#listNotifications`
- **Input:** Authenticated recipient account ID.
- **Success result:** `found` with recipient notifications newest first.
- **Expected rejections:** `invalid-recipient`
- **Authorization:** Recipient ID is resolved from the HttpOnly session.
- **Transaction:** Read-only query over the context-owned PostgreSQL store.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `engagement-notifications-source-01`
- **Local policy:** Only the recipient can list a notification.

### `mark-notification-read` [active]

- **Type:** `command`
- **Application boundary:** `MarkNotificationReadUseCase.markNotificationRead()`
- **Public entrypoint:** `server-api.ts#markNotificationRead`
- **Input:** Recipient account ID and notification ID.
- **Success result:** `read`.
- **Expected rejections:** `notification-not-found`
- **Authorization:** Recipient ownership is checked in the repository lookup.
- **Transaction:** Replace one notification through the context-owned PostgreSQL adapter.
- **Idempotency:** Marking an already-read notification remains `read`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `engagement-notifications-source-01`
- **Local policy:** Cross-recipient lookup returns not found.

## Ubiquitous language

- **Notification**: recipient-specific update for subscribed activity.
- **Reason**: why the recipient received the update.
- **Inbox state**: triage state such as unread or read.

## Ownership and invariants

Owns the complete catalog notification model. Every record has exactly one
recipient.

## Public capabilities

`listNotifications` and `markNotificationRead`.

## Dependencies and consistency

The active inbox uses persisted notification records; upstream subscription
and event consumption remain planned and no synthetic real-time delivery is
claimed.

## Authorization

The authenticated recipient account ID scopes every query and mutation.

## Persistence and transactions

Production composition stores notifications in context-owned PostgreSQL
tables. The in-memory adapter remains an isolated development and test
alternative.

## Data classification

Notification subjects and reasons may reveal private repository activity and
must remain recipient-scoped.

## Retention and erasure

Notification records are durable in PostgreSQL. Automated enforcement of the
documented five-month and saved-notification retention rules remains planned.

## Events and failure behavior

Events remain planned until transactional publication exists.

## Official sources

- <https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications>
- <https://docs.github.com/en/subscriptions-and-notifications/reference/inbox-filters>

## Exceptions

None.
