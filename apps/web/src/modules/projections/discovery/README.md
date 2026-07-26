# Discovery

## Purpose

Present public explore feeds, collections, topics, and trending references.

## Context content tree

- Explore feed [active]
  - `get-explore-feed`
  - Owned: `DiscoveryFeed`, `CuratedCollection`, `TopicListing`,
    `TrendingListing`
- Topic detail and independent collection/trending queries [planned]
- Runtime dependencies: none.
- Excludes: `RepositorySearch`, `RankingTelemetryOwnership`,
  `RepositoryContent`.

## Designed use cases

### `get-explore-feed` [active]

- **Type:** `query`
- **Application boundary:** `GetExploreFeedUseCase.getExploreFeed()`
- **Public entrypoint:** `server-api.ts#getExploreFeed`
- **Input:** None.
- **Success result:** `found` with public repositories, topics, and collections.
- **Expected rejections:** `none`
- **Authorization:** Public projection only.
- **Transaction:** Read-only projection snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `projections-discovery-source-01`
- **Local policy:** Ordering is deterministic fixture order; no behavioral ranking is claimed.

## Ubiquitous language

- **Explore feed:** public discovery cards and supporting topic/collection data.
- **Trending listing:** cataloged public discovery projection, not telemetry ownership.

## Ownership and invariants

The context owns discovery presentation only. The active feed contains public
references and stable ordering.

## Public capabilities

`getExploreFeed`.

## Dependencies and consistency

No runtime dependency in the active fixture-backed slice.

## Authorization

Only public cards are returned.

## Persistence and transactions

Read-only immutable in-memory fixture.

## Data classification

Public repository and topic metadata.

## Retention and erasure

Process lifetime only.

## Events and failure behavior

Read-model queries publish no events.

## Official sources

- <https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github>

## Exceptions

None.
