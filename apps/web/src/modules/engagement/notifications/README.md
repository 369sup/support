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
- **Transaction:** Read-only process-local snapshot.
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
- **Transaction:** Replace one process-local notification.
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

The active inbox uses fixtures; upstream subscription and event consumption
remain planned and no synthetic real-time delivery is claimed.

## Authorization

The authenticated recipient account ID scopes every query and mutation.

## Persistence and transactions

Notifications are process-local and non-durable.

## Data classification

Notification subjects and reasons may reveal private repository activity and
must remain recipient-scoped.

## Retention and erasure

Process lifetime only. Durable implementation must apply the documented
five-month and saved-notification retention rules.

## Events and failure behavior

Events remain planned until transactional publication exists.

## Official sources

- <https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications>
- <https://docs.github.com/en/subscriptions-and-notifications/reference/inbox-filters>

## Exceptions

None.
