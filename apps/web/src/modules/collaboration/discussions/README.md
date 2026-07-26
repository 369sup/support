# Discussions

## Purpose

Own repository and organization discussion spaces, categories, lifecycle, and
advanced discussion affordances.

## Context content tree

- Repository discussions [active]
  - `create-discussion`
  - `get-repository-discussion`
  - `list-repository-discussions`
  - Owned: `RepositoryDiscussionForum`, `Discussion`, `DiscussionCategory`
- Organization spaces, sections, polls, answers, and pins [planned]
  - Owned: `OrganizationDiscussionSpace`, `DiscussionSection`,
    `DiscussionPoll`, `AcceptedAnswer`, `PinnedDiscussion`
- Planned events: `DiscussionCreated@1`, `DiscussionUpdated@1`,
  `DiscussionClosed@1`, `DiscussionReopened@1`, `DiscussionDeleted@1`,
  `DiscussionTransferred@1`, `DiscussionCategoryCreated@1`,
  `DiscussionCategoryUpdated@1`, `DiscussionCategoryDeleted@1`,
  `DiscussionSectionCreated@1`, `DiscussionSectionUpdated@1`,
  `DiscussionSectionDeleted@1`, `DiscussionAnswerMarked@1`,
  `DiscussionAnswerUnmarked@1`, `DiscussionPinned@1`,
  `DiscussionUnpinned@1`, `OrganizationDiscussionSpaceEnabled@1`,
  `OrganizationDiscussionSpaceDisabled@1`,
  `OrganizationDiscussionSourceChanged@1`
- Runtime dependencies: none.
- Excludes: `Comment`, `LabelDefinition`, `Issue`, `TeamDiscussion`.

## Designed use cases

### `create-discussion` [active]

- **Type:** `command`
- **Application boundary:** `CreateDiscussionUseCase.createDiscussion()`
- **Public entrypoint:** `server-api.ts#createDiscussion`
- **Input:** Repository ID, authenticated author, category, title, body, and timestamp.
- **Success result:** `created` with the new numbered discussion.
- **Expected rejections:** `invalid-discussion`
- **Authorization:** Delivery establishes authenticated repository read access.
- **Transaction:** Insert one process-local discussion.
- **Idempotency:** Not idempotent; retries create another discussion.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-discussions-source-01`
- **Local policy:** Active categories are `general`, `q-and-a`, and `announcements`.

### `get-repository-discussion` [active]

- **Type:** `query`
- **Application boundary:** `GetRepositoryDiscussionUseCase.getRepositoryDiscussion()`
- **Public entrypoint:** `server-api.ts#getRepositoryDiscussion`
- **Input:** Repository ID and discussion number.
- **Success result:** `found` with one discussion.
- **Expected rejections:** `discussion-not-found`
- **Authorization:** Delivery establishes repository read access.
- **Transaction:** Read-only snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-discussions-source-01`
- **Local policy:** Comments are queried separately from `collaboration/conversations`.

### `list-repository-discussions` [active]

- **Type:** `query`
- **Application boundary:** `ListRepositoryDiscussionsUseCase.listRepositoryDiscussions()`
- **Public entrypoint:** `server-api.ts#listRepositoryDiscussions`
- **Input:** Repository ID.
- **Success result:** `found` with discussions ordered by update time.
- **Expected rejections:** `none`
- **Authorization:** Delivery establishes repository read access.
- **Transaction:** Read-only snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-discussions-source-01`
- **Local policy:** Only repository discussions are active.

## Ubiquitous language

- **Discussion:** repository-scoped community conversation starter.
- **Category:** one of the enabled discussion purposes.

## Ownership and invariants

The context owns discussion spaces, discussions, categories, sections, polls,
answers, and pins. The active slice requires non-empty title and body and
assigns a monotonically increasing repository-local number.

## Public capabilities

`createDiscussion`, `getRepositoryDiscussion`, and
`listRepositoryDiscussions`.

## Dependencies and consistency

Delivery resolves repository permission. Comments and reports use their own
public bounded-context entrypoints.

## Authorization

Authenticated repository readers may use the active slice. Administrative
category, answer, pin, transfer, and lifecycle operations remain planned.

## Persistence and transactions

Discussions are process-local and non-durable; one command writes one record.

## Data classification

Discussion content inherits repository visibility.

## Retention and erasure

Process lifetime only; durable deletion and transfer remain planned.

## Events and failure behavior

Cataloged discussion events remain planned until transactional publication
exists. Validation and not-found outcomes are explicit.

## Official sources

- <https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions>
- <https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/participating-in-a-discussion>

## Exceptions

None.
