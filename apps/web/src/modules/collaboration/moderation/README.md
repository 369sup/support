# Moderation Bounded Context

- **Catalog path:** `collaboration/moderation`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Content reports, moderation cases, blocks, interaction limits, and visibility decisions.

## Context content tree

- `collaboration/moderation` [planned]
  - Purpose: Content reports, moderation cases, blocks, interaction limits, and visibility decisions.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `ContentReport`
    - `ModerationCase`
    - `InteractionLimit`
    - `OrganizationBlock`
    - `ContentVisibilityDecision`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `ContentReported@1` [planned]: content reported.
    - `ContentReportResolved@1` [planned]: content report resolved.
    - `ContentReportReopened@1` [planned]: content report reopened.
    - `InteractionLimitSet@1` [planned]: interaction limit set.
    - `InteractionLimitLifted@1` [planned]: interaction limit lifted.
    - `OrganizationBlocked@1` [planned]: organization blocked.
    - `OrganizationUnblocked@1` [planned]: organization unblocked.
    - `ContentHidden@1` [planned]: content hidden.
    - `ContentUnhidden@1` [planned]: content unhidden.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `repositories/repository-access::ModerationPermission` (synchronous)
    - `collaboration/issues::IssueModerationTarget` (synchronous)
    - `collaboration/conversations::ConversationModerationTarget` (synchronous)
    - `collaboration/discussions::DiscussionModerationTarget` (synchronous)
- Explicit exclusions
  - `CommentBody`
  - `IssueState`
  - `DiscussionState`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `ContentReport`, `ModerationCase`, `InteractionLimit`, `OrganizationBlock`, `ContentVisibilityDecision`.
It excludes `CommentBody`, `IssueState`, `DiscussionState`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationReference` (synchronous)
- `repositories/repository-access::ModerationPermission` (synchronous)
- `collaboration/issues::IssueModerationTarget` (synchronous)
- `collaboration/conversations::ConversationModerationTarget` (synchronous)
- `collaboration/discussions::DiscussionModerationTarget` (synchronous)

## Official sources

- `collaboration-moderation-source-01`: [content moderation, interaction limits, blocking, conversation locking](https://docs.github.com/en/communities/moderating-comments-and-conversations) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
