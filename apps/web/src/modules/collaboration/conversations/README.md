# Conversations Bounded Context

- **Catalog path:** `collaboration/conversations`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Capability-constrained comments, discussion replies, reactions, mentions, revisions, and locks for a closed set of subjects.

## Context content tree

- `collaboration/conversations` [planned]
  - Purpose: Capability-constrained comments, discussion replies, reactions, mentions, revisions, and locks for a closed set of subjects.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `Conversation`
    - `Comment`
    - `Reply`
    - `Reaction`
    - `Mention`
    - `CommentRevision`
    - `ConversationSubjectKind`
    - `ConversationCapabilities`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `ConversationCreated@1` [planned]: conversation created.
    - `ConversationLocked@1` [planned]: conversation locked.
    - `ConversationUnlocked@1` [planned]: conversation unlocked.
    - `CommentAdded@1` [planned]: comment added.
    - `CommentEdited@1` [planned]: comment edited.
    - `CommentDeleted@1` [planned]: comment deleted.
    - `ReplyAdded@1` [planned]: reply added.
    - `ReactionAdded@1` [planned]: reaction added.
    - `ReactionRemoved@1` [planned]: reaction removed.
    - `MentionDetected@1` [planned]: mention detected.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::ActorReference` (synchronous)
    - `repositories/repositories::RepositoryLifecycleState` (synchronous)
- Explicit exclusions
  - `IssueState`
  - `DiscussionCategory`
  - `ModerationCase`
  - `ArbitrarySubjectType`

## Ubiquitous language

The catalog reserves these terms for this context:

- `Conversation`
- `Comment`
- `Reply`
- `Reaction`
- `Mention`
- `CommentRevision`
- `ConversationSubjectKind`
- `ConversationCapabilities`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `Conversation`, `Comment`, `Reply`, `Reaction`, `Mention`, `CommentRevision`, `ConversationSubjectKind`, `ConversationCapabilities`.
It excludes `IssueState`, `DiscussionCategory`, `ModerationCase`, `ArbitrarySubjectType`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::ActorReference` (synchronous)
- `repositories/repositories::RepositoryLifecycleState` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `ConversationCreated@1` (domain, planned): conversation created. contract and ordering pending activation.
- `ConversationLocked@1` (domain, planned): conversation locked. contract and ordering pending activation.
- `ConversationUnlocked@1` (domain, planned): conversation unlocked. contract and ordering pending activation.
- `CommentAdded@1` (domain, planned): comment added. contract and ordering pending activation.
- `CommentEdited@1` (domain, planned): comment edited. contract and ordering pending activation.
- `CommentDeleted@1` (domain, planned): comment deleted. contract and ordering pending activation.
- `ReplyAdded@1` (domain, planned): reply added. contract and ordering pending activation.
- `ReactionAdded@1` (domain, planned): reaction added. contract and ordering pending activation.
- `ReactionRemoved@1` (domain, planned): reaction removed. contract and ordering pending activation.
- `MentionDetected@1` (domain, planned): mention detected. contract and ordering pending activation.

## Official sources

- `collaboration-conversations-source-01`: [comments, mentions, reactions](https://docs.github.com/en/get-started/using-github/communicating-on-github) (verified 2026-07-22)
- `collaboration-conversations-source-02`: [discussion comment threads, threaded replies](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/participating-in-a-discussion) (verified 2026-07-22)
- `collaboration-conversations-source-03`: [issue conversation locks, locked-conversation behavior](https://docs.github.com/en/communities/moderating-comments-and-conversations/locking-conversations) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
