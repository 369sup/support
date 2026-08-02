# Moderation

## Purpose

Own content reports and the future moderation case, interaction, block, and
visibility decisions used to support healthy collaboration.

## Context content tree

- Content reporting [active]
  - `report-content`
  - Owned: `ContentReport`, `ModerationCase`
- Moderation controls [planned]
  - Owned: `InteractionLimit`, `OrganizationBlock`,
    `ContentVisibilityDecision`
- Planned events
  - `ContentReported@1`, `ContentReportResolved@1`,
    `ContentReportReopened@1`, `InteractionLimitSet@1`,
    `InteractionLimitLifted@1`, `OrganizationBlocked@1`,
    `OrganizationUnblocked@1`, `ContentHidden@1`, `ContentUnhidden@1`
- Runtime dependencies: none.
- Explicit exclusions: `CommentBody`, `IssueState`, `DiscussionState`.

## Designed use cases

### `report-content` [active]

- **Type:** `command`
- **Application boundary:** `ReportContentUseCase.reportContent()`
- **Public entrypoint:** `server-api.ts#reportContent`
- **Input:** Reporter account ID, target kind and ID, reason, and ISO timestamp.
- **Success result:** `reported` with an open report reference.
- **Expected rejections:** `invalid-report`, `duplicate-report`
- **Authorization:** Target delivery establishes signed-in read access.
- **Transaction:** Insert one reporter/target open report.
- **Idempotency:** A duplicate open report by the same reporter is rejected.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-moderation-source-01`
- **Local policy:** Active targets are issue and comment; reasons are abuse, spam, or off-topic.

## Ubiquitous language

- **Content report**: a reporter's request for moderator review.
- **Moderation case**: review lifecycle associated with one or more reports.
- **Visibility decision**: moderator-owned content presentation outcome.

## Ownership and invariants

This context owns `ContentReport`, `ModerationCase`, `InteractionLimit`,
`OrganizationBlock`, and `ContentVisibilityDecision`. It never owns or mutates
comment bodies, issue state, or discussion state.

## Public capabilities

`reportContent` is exported by `server-api.ts`.

## Dependencies and consistency

Delivery supplies a stable supported target only after read access is
established. Planned target contracts remain non-runtime.

## Authorization

Any signed-in reader may report a visible active target. Resolution, hiding,
blocks, and interaction limits remain planned moderator operations.

## Persistence and transactions

Production composition stores open reports in a context-owned PostgreSQL table
with duplicate detection. The in-memory adapter remains an isolated
development and test alternative.

## Data classification

Reporter identifiers, target references, reasons, and timestamps are sensitive
moderation data and must not be displayed publicly.

## Retention and erasure

Reports are durable in PostgreSQL. Final retention and reviewer access policy
remain blocked.

## Events and failure behavior

Catalog moderation events remain planned until durable transaction and
publication exist. Expected validation and duplicate results are discriminated
values.

## Official sources

- <https://docs.github.com/en/communities/moderating-comments-and-conversations>

## Exceptions

None.
