# Search

## Purpose

Present permission-filtered product resource search while excluding code
search.

## Context content tree

- Public resource search [active]
  - `search-public-resources`
  - Owned: `SearchDocument`, `SearchResultProjection`
- Authenticated multi-scope search [planned]
- Runtime dependency: `platform/search-index::SearchIndexPort`.
- Excludes: `SourceAggregate`, `AuthorizationSourceOfTruth`, `CodeSearch`.

## Designed use cases

### `search-public-resources` [active]

- **Type:** `query`
- **Application boundary:** `SearchPublicResourcesUseCase.searchPublicResources()`
- **Public entrypoint:** `server-api.ts#searchPublicResources`
- **Input:** Search text.
- **Success result:** `found` with supported public resource results.
- **Expected rejections:** `none`
- **Authorization:** Uses the public candidate key and maps only cataloged public fixtures.
- **Transaction:** Read-only index query.
- **Idempotency:** Query.
- **Dependencies:** `platform/search-index::SearchIndexPort`
- **Published events:** `none`
- **Official evidence:** `projections-search-source-01`
- **Local policy:** Supports profiles, repositories, issues, discussions, and projects; code is excluded.

## Ubiquitous language

- **Candidate:** coarse index match that is not itself authorization proof.
- **Search result:** candidate approved for presentation by this projection.

## Ownership and invariants

The projection owns denormalized result presentation, never source aggregates
or final authorization truth.

## Public capabilities

`searchPublicResources`.

## Dependencies and consistency

The query uses the public `platform/search-index` entrypoint. The durable index
is eventually consistent with its source contexts by design.

## Authorization

The active route returns public fixtures only. Private and internal results are
not in the active scope.

## Persistence and transactions

Read-only over the production PostgreSQL search index through the platform
context's public entrypoint.

## Data classification

Only public fixture metadata is returned.

## Retention and erasure

Result lifetime follows source-document removal and index rebuild policy.

## Events and failure behavior

The projection publishes no events; unsupported document kinds are omitted.

## Official sources

- <https://docs.github.com/en/search-github>

## Exceptions

None.
