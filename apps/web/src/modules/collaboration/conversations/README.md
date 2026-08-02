# Conversations

## Purpose

Own comments and reactions for the closed set of supported issue and discussion
subjects.

## Context content tree

- Issue conversation [active]
  - `list-conversation-comments`
  - `add-comment`
  - `add-reaction`
  - Owned: `Conversation`, `Comment`, `Reaction`,
    `ConversationSubjectKind`, `ConversationCapabilities`
- Threading and revisions [planned]
  - Owned: `Reply`, `Mention`, `CommentRevision`
- Planned events
  - `ConversationCreated@1`, `ConversationLocked@1`,
    `ConversationUnlocked@1`, `CommentAdded@1`, `CommentEdited@1`,
    `CommentDeleted@1`, `ReplyAdded@1`, `ReactionAdded@1`,
    `ReactionRemoved@1`, `MentionDetected@1`
- Runtime dependencies: none.
- Explicit exclusions: `IssueState`, `DiscussionCategory`, `ModerationCase`,
  `ArbitrarySubjectType`.

## Designed use cases

### `list-conversation-comments` [active]

- **Type:** `query`
- **Application boundary:** `ListConversationCommentsUseCase.listConversationComments()`
- **Public entrypoint:** `server-api.ts#listConversationComments`
- **Input:** Subject kind and stable subject ID.
- **Success result:** Ordered comments and reaction counts.
- **Expected rejections:** `invalid-subject`
- **Authorization:** The owning subject delivery establishes read access.
- **Transaction:** Read-only query over the context-owned PostgreSQL store.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-conversations-source-01`
- **Local policy:** Comments are returned oldest first.

### `add-comment` [active]

- **Type:** `command`
- **Application boundary:** `AddCommentUseCase.addComment()`
- **Public entrypoint:** `server-api.ts#addComment`
- **Input:** Subject kind and ID, actor ID and username, body, and ISO timestamp.
- **Success result:** `added` with the comment.
- **Expected rejections:** `invalid-comment`, `conversation-locked`
- **Authorization:** Subject delivery establishes authenticated participation.
- **Transaction:** Allocate one comment ID and append one record.
- **Idempotency:** Not idempotent.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-conversations-source-01`
- **Local policy:** Reject empty comments and writes to a locked conversation.

### `add-reaction` [active]

- **Type:** `command`
- **Application boundary:** `AddReactionUseCase.addReaction()`
- **Public entrypoint:** `server-api.ts#addReaction`
- **Input:** Subject ID, comment ID, actor ID, and supported reaction.
- **Success result:** `added` with updated reaction counts.
- **Expected rejections:** `comment-not-found`, `duplicate-reaction`, `invalid-reaction`
- **Authorization:** Subject delivery establishes authenticated participation.
- **Transaction:** Insert one actor/comment/reaction tuple.
- **Idempotency:** Duplicate tuples return `duplicate-reaction`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-conversations-source-01`
- **Local policy:** Supported reactions are thumbs-up, heart, hooray, and eyes.

## Ubiquitous language

- **Subject**: an issue or discussion that owns a conversation.
- **Comment**: authored message in a subject conversation.
- **Reaction**: one supported actor expression attached to a comment.

## Ownership and invariants

This context owns `Conversation`, `Comment`, `Reply`, `Reaction`, `Mention`,
`CommentRevision`, `ConversationSubjectKind`, and
`ConversationCapabilities`. Subjects are a closed literal set.

## Public capabilities

`listConversationComments`, `addComment`, and `addReaction` are exported from
`server-api.ts`.

## Dependencies and consistency

The context store accepts stable subject references after delivery has
validated the owning subject and permission.

## Authorization

The owning subject delivery establishes read and participation permission.
Conversation-local lock and duplicate-reaction rules are enforced here.

## Persistence and transactions

Production composition stores comments and actor reaction tuples in
context-owned PostgreSQL tables. Each command changes only this context; no
cross-context transaction or global ordering guarantee is implied. The
in-memory adapter remains an isolated development and test alternative.

## Data classification

Comment bodies, actor identifiers, reactions, and timestamps are repository
collaboration data.

## Retention and erasure

Comment and reaction records are durable in PostgreSQL. Revision, deletion,
mention, and final erasure behavior remains planned.

## Events and failure behavior

Catalog events remain planned until transactional publication exists. Expected
validation, lock, duplication, and absence results are discriminated values.

## Official sources

- <https://docs.github.com/en/get-started/using-github/communicating-on-github>
- <https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/participating-in-a-discussion>
- <https://docs.github.com/en/communities/moderating-comments-and-conversations/locking-conversations>

## Exceptions

None.
