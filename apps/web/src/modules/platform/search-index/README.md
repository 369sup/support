# Search Index Bounded Context

- **Catalog path:** `platform/search-index`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `not-applicable`

## Purpose

Store versioned search documents and return authorization-keyed candidates.
This context never makes the final product authorization decision.

## Context content tree

- Search index [active]
  - `upsert-search-document`
  - `remove-search-document`
  - `query-search-index`
- Owned concepts
  - `IndexDocument`
  - `IndexCursor`
  - `IndexOperation`
- Published events
  - `SearchDocumentUpserted@1` [planned]
  - `SearchDocumentRemoved@1` [planned]
  - `SearchIndexRebuilt@1` [planned]
- Runtime dependencies: none.
- Explicit exclusions
  - `SearchSemantics`
  - `AuthorizationDecision`
  - `SourceAggregate`
  - `SearchResultPresentation`

## Designed use cases

### `upsert-search-document` [active]

- **Type:** `command`
- **Application boundary:** `UpsertSearchDocumentUseCase.upsertSearchDocument()`
- **Public entrypoint:** `server-api.ts#upsertSearchDocument`
- **Input:** A stable document ID, source version, searchable text, authorization keys, and expected index version.
- **Success result:** `upserted` with the new versioned document.
- **Expected rejections:** `version-conflict`
- **Authorization:** Internal projector only; the source context must supply coarse candidate keys.
- **Transaction:** One search-index document replacement.
- **Idempotency:** Retrying with a stale expected version is rejected.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Authorization keys narrow candidates but never prove access.

### `remove-search-document` [active]

- **Type:** `command`
- **Application boundary:** `RemoveSearchDocumentUseCase.removeSearchDocument()`
- **Public entrypoint:** `server-api.ts#removeSearchDocument`
- **Input:** Document ID and expected version.
- **Success result:** `removed`.
- **Expected rejections:** `document-not-found`, `version-conflict`
- **Authorization:** Internal projector only.
- **Transaction:** One search-index document deletion.
- **Idempotency:** A repeated deletion returns `document-not-found`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Removal is immediate in the process-local index.

### `query-search-index` [active]

- **Type:** `query`
- **Application boundary:** `QuerySearchIndexUseCase.querySearchIndex()`
- **Public entrypoint:** `server-api.ts#querySearchIndex`
- **Input:** Search text with optional kind, authorization-key, and bounded limit.
- **Success result:** Ranked candidate references.
- **Expected rejections:** `none`
- **Authorization:** Callers must re-check each candidate with its authoritative context.
- **Transaction:** Read-only.
- **Idempotency:** Repeated queries over the same state are stable.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Exact-title matches rank above title and body substring matches.

## Ubiquitous language

- **Search document:** Versioned, denormalized searchable data supplied by a
  source context.
- **Authorization key:** Coarse candidate filter, not an access decision.
- **Candidate:** Search hit that still requires authoritative authorization.

## Ownership and invariants

The index owns only denormalized documents and index versions. Source versions
are retained so projectors can reject stale updates. Product meaning and
authorization remain with their owning contexts.

## Public capabilities

Server commands update or remove documents. The query returns
`SearchCandidateReference` values through the public contract.

## Dependencies and consistency

There are no runtime context dependencies. Projectors call this context after
their source transaction commits, so the index is eventually consistent.

## Authorization

No browser route is active. Authorization keys are a pre-filter only; callers
must resolve authoritative permission before presenting a result.

## Persistence and transactions

The active adapter is a versioned, injectable, process-local Map. Every command
changes at most one index record.

## Data classification

Documents may contain public or access-controlled titles and excerpts. They
must not contain secrets, credentials, or full private payloads.

## Retention and erasure

Source deletion must remove the document. Process restart removes all index
data. Durable retention and rebuild orchestration remain planned.

## Events and failure behavior

Technical index events remain planned. Version conflicts are explicit and
dependency-free; no failed update partially mutates a document.

## Official sources

Not applicable; this is a technical capability governed by
[ADR-0003](../../../../../../docs/architecture/decisions/ADR-0003-in-memory-event-and-policy-runtime.md).

## Exceptions

The in-memory index is non-durable, single-process, and restart-invalidated.
