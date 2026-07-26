# Discovery Bounded Context

- **Catalog path:** `projections/discovery`
- **Kind:** `projection`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Public discovery projections for explore feeds, curated collections, topics, and trending repositories.

## Context content tree

- `projections/discovery` [planned]
  - Approved use cases: `get-explore-feed`, `list-curated-collections`, `list-topics`, `get-topic`, `list-trending-repositories`
  - Owned concepts: `DiscoveryFeed`, `CuratedCollection`, `TopicListing`, `TrendingListing`
  - Published events: none; Discovery is a read-model context and does not publish product facts.
- Planned relationships
  - None.
- Explicit exclusions: `RepositorySearch`, `RankingTelemetryOwnership`, `RepositoryContent`

## Designed use cases

### `get-explore-feed` [planned]

- **Type:** `query`
- **Application boundary:** `GetExploreFeedUseCase.getExploreFeed()`
- **Public entrypoint:** `server-api.ts#getExploreFeed`
- **Input:** An optional public discovery cursor.
- **Success result:** A deterministic page of public discovery cards.
- **Expected rejections:** `none`
- **Authorization:** None; only public projections are returned.
- **Transaction:** Read-only projection snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `projections-discovery-source-01`
- **Local policy:** Ordering inputs and tie-breaking must be cataloged before activation; the route does not invent ranking policy.

### `list-curated-collections` [planned]

- **Type:** `query`
- **Application boundary:** `ListCuratedCollectionsUseCase.listCuratedCollections()`
- **Public entrypoint:** `server-api.ts#listCuratedCollections`
- **Input:** An optional public collection cursor.
- **Success result:** A deterministic page of curated public collections.
- **Expected rejections:** `none`
- **Authorization:** None; only public projections are returned.
- **Transaction:** Read-only projection snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `projections-discovery-source-01`
- **Local policy:** Ordering inputs and tie-breaking must be cataloged before activation; the route does not invent ranking policy.

### `list-topics` [planned]

- **Type:** `query`
- **Application boundary:** `ListTopicsUseCase.listTopics()`
- **Public entrypoint:** `server-api.ts#listTopics`
- **Input:** An optional public topic cursor.
- **Success result:** A deterministic page of public topics.
- **Expected rejections:** `none`
- **Authorization:** None; only public projections are returned.
- **Transaction:** Read-only projection snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `projections-discovery-source-01`
- **Local policy:** Ordering inputs and tie-breaking must be cataloged before activation; the route does not invent ranking policy.

### `get-topic` [planned]

- **Type:** `query`
- **Application boundary:** `GetTopicUseCase.getTopic()`
- **Public entrypoint:** `server-api.ts#getTopic`
- **Input:** A normalized topic slug.
- **Success result:** The public topic projection and its visible repository references.
- **Expected rejections:** `topic-not-found`
- **Authorization:** None; only public projections are returned.
- **Transaction:** Read-only projection snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `projections-discovery-source-01`
- **Local policy:** Ordering inputs and tie-breaking must be cataloged before activation; the route does not invent ranking policy.

### `list-trending-repositories` [planned]

- **Type:** `query`
- **Application boundary:** `ListTrendingRepositoriesUseCase.listTrendingRepositories()`
- **Public entrypoint:** `server-api.ts#listTrendingRepositories`
- **Input:** A cataloged time window and optional spoken-language filter.
- **Success result:** A stable ordered page of public repository references.
- **Expected rejections:** `none`
- **Authorization:** None; only public projections are returned.
- **Transaction:** Read-only projection snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `projections-discovery-source-01`
- **Local policy:** Ordering inputs and tie-breaking must be cataloged before activation; the route does not invent ranking policy.

## Ownership and invariants

This context alone owns `DiscoveryFeed`, `CuratedCollection`, `TopicListing`, `TrendingListing`.
It explicitly excludes `RepositorySearch`, `RankingTelemetryOwnership`, `RepositoryContent`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

None.

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `projections-discovery-source-01`: [explore and discovery, topic navigation, trending discovery](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
