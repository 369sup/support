# Notifications Bounded Context

- **Catalog path:** `engagement/notifications`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

User notification records, inboxes, reasons, filters, and read, saved, or done state.

## Context content tree

- `engagement/notifications` [planned]
  - Purpose: User notification records, inboxes, reasons, filters, and read, saved, or done state.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `Notification`
    - `NotificationInbox`
    - `NotificationReason`
    - `NotificationState`
    - `InboxFilter`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `NotificationCreated@1` [planned]: notification created.
    - `NotificationRead@1` [planned]: notification read.
    - `NotificationUnread@1` [planned]: notification unread.
    - `NotificationSaved@1` [planned]: notification saved.
    - `NotificationUnsaved@1` [planned]: notification unsaved.
    - `NotificationDone@1` [planned]: notification done.
    - `NotificationReopened@1` [planned]: notification reopened.
    - `InboxFilterChanged@1` [planned]: inbox filter changed.
    - `NotificationDeliveryRequested@1` [planned]: notification delivery requested after recipient and read-access resolution.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::NotificationRecipient` (synchronous)
    - `engagement/subscriptions::NotificationInterestDecision` (synchronous)
    - `repositories/repository-access::EffectiveReadPermission` (synchronous)
    - `collaboration/issues::IssueNotificationEvents` (event; events `IssueCreated@1`, `IssueUpdated@1`, `IssueAssigned@1`, `IssueUnassigned@1`, `IssueClosed@1`, `IssueReopened@1`)
    - `collaboration/conversations::ConversationNotificationEvents` (event; events `CommentAdded@1`, `ReplyAdded@1`, `MentionDetected@1`)
    - `collaboration/discussions::DiscussionNotificationEvents` (event; events `DiscussionCreated@1`, `DiscussionUpdated@1`, `DiscussionAnswerMarked@1`)
    - `repositories/repository-access::RepositoryInvitationEvents` (event; events `RepositoryInvitationCreated@1`)
- Explicit exclusions
  - `SubscriptionPreference`
  - `EmailDelivery`
  - `PushDelivery`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `Notification`
- `NotificationInbox`
- `NotificationReason`
- `NotificationState`
- `InboxFilter`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `Notification`, `NotificationInbox`, `NotificationReason`, `NotificationState`, `InboxFilter`.
It excludes `SubscriptionPreference`, `EmailDelivery`, `PushDelivery`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::NotificationRecipient` (synchronous)
- `engagement/subscriptions::NotificationInterestDecision` (synchronous)
- `repositories/repository-access::EffectiveReadPermission` (synchronous)
- `collaboration/issues::IssueNotificationEvents` (event; events `IssueCreated@1`, `IssueUpdated@1`, `IssueAssigned@1`, `IssueUnassigned@1`, `IssueClosed@1`, `IssueReopened@1`)
- `collaboration/conversations::ConversationNotificationEvents` (event; events `CommentAdded@1`, `ReplyAdded@1`, `MentionDetected@1`)
- `collaboration/discussions::DiscussionNotificationEvents` (event; events `DiscussionCreated@1`, `DiscussionUpdated@1`, `DiscussionAnswerMarked@1`)
- `repositories/repository-access::RepositoryInvitationEvents` (event; events `RepositoryInvitationCreated@1`)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `NotificationCreated@1` (domain, planned): notification created. contract and ordering pending activation.
- `NotificationRead@1` (domain, planned): notification read. contract and ordering pending activation.
- `NotificationUnread@1` (domain, planned): notification unread. contract and ordering pending activation.
- `NotificationSaved@1` (domain, planned): notification saved. contract and ordering pending activation.
- `NotificationUnsaved@1` (domain, planned): notification unsaved. contract and ordering pending activation.
- `NotificationDone@1` (domain, planned): notification done. contract and ordering pending activation.
- `NotificationReopened@1` (domain, planned): notification reopened. contract and ordering pending activation.
- `InboxFilterChanged@1` (domain, planned): inbox filter changed. contract and ordering pending activation.
- `NotificationDeliveryRequested@1` (integration, planned): notification delivery requested after recipient and read-access resolution. contract and ordering pending activation.

## Official sources

- `engagement-notifications-source-01`: [notifications, recipient interest, notification retention](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications) (verified 2026-07-22)
- `engagement-notifications-source-02`: [notification reasons, inbox filters, notification state](https://docs.github.com/en/subscriptions-and-notifications/reference/inbox-filters) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
