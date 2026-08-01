# Media Storage Bounded Context

- **Catalog path:** `platform/media-storage`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `not-applicable`

## Purpose

Store opaque media bytes behind metadata-only references and enforce
quarantine, deletion, checksum, and classification state.

## Context content tree

- Media storage [active]
  - `store-media`
  - `get-media-reference`
  - `quarantine-media`
  - `delete-media`
- Owned concepts
  - `MediaReference`
  - `MediaObject`
  - `MediaStoragePolicy`
- Published events
  - `MediaStored@1` [planned]
  - `MediaDeleted@1` [planned]
  - `MediaQuarantined@1` [planned]
- Runtime dependencies: `@support/supabase/storage`,
  `@support/supabase/postgres`.
- Explicit exclusions
  - `RepositoryContent`
  - `ReleaseAsset`
  - `ProductVisibilityRule`

## Designed use cases

### `store-media` [active]

- **Type:** `command`
- **Application boundary:** `StoreMediaUseCase.storeMedia()`
- **Public entrypoint:** `server-api.ts#storeMedia`
- **Input:** Bytes, content type, and data classification.
- **Success result:** `stored` with a metadata-only `MediaReference`.
- **Expected rejections:** `none`
- **Authorization:** Internal owning-context command only; no public upload route is active.
- **Transaction:** Upload bytes to Supabase Storage, then insert durable
  PostgreSQL metadata; a failed metadata insert compensates by removing bytes.
- **Idempotency:** Callers must supply command idempotency before a future transport is activated.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Bytes never appear in the returned reference or logs.

### `get-media-reference` [active]

- **Type:** `query`
- **Application boundary:** `GetMediaReferenceUseCase.getMediaReference()`
- **Public entrypoint:** `server-api.ts#getMediaReference`
- **Input:** Media ID.
- **Success result:** `found` with metadata and lifecycle state.
- **Expected rejections:** `media-not-found`
- **Authorization:** The owning product context authorizes access before calling.
- **Transaction:** Read-only.
- **Idempotency:** Stable for the same state.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Deleted media is indistinguishable from absence.

### `quarantine-media` [active]

- **Type:** `command`
- **Application boundary:** `QuarantineMediaUseCase.quarantineMedia()`
- **Public entrypoint:** `server-api.ts#quarantineMedia`
- **Input:** Media ID and expected version.
- **Success result:** `quarantined` with the next version.
- **Expected rejections:** `media-not-found`, `version-conflict`
- **Authorization:** Internal security workflow only.
- **Transaction:** One media lifecycle update.
- **Idempotency:** A repeated stale command returns `version-conflict`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Quarantined bytes remain retained but are not eligible for delivery.

### `delete-media` [active]

- **Type:** `command`
- **Application boundary:** `DeleteMediaUseCase.deleteMedia()`
- **Public entrypoint:** `server-api.ts#deleteMedia`
- **Input:** Media ID and expected version.
- **Success result:** `deleted`.
- **Expected rejections:** `media-not-found`, `version-conflict`
- **Authorization:** The owning product context authorizes deletion.
- **Transaction:** One version-checked metadata tombstone and durable Storage
  removal operation; pending removals are retried during runtime composition.
- **Idempotency:** Repeated deletion returns `media-not-found`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** In-memory bytes are replaced with an empty buffer immediately.

## Ubiquitous language

- **Media object:** Opaque bytes plus storage metadata.
- **Media reference:** Metadata-only value safe for cross-context use.
- **Quarantine:** Retained media that must not be delivered.

## Ownership and invariants

Storage keys and media IDs are unique. Checksums are computed by the adapter.
Returned references never include bytes, deletion timestamps, or secrets.

## Public capabilities

The server API exposes internal media lifecycle operations. Product contexts
exchange only `MediaReference`.

## Dependencies and consistency

There are no runtime context dependencies. A product context stores its media
reference after this context confirms storage.

## Authorization

No browser route is active. Product ownership and access remain outside this
technical context.

## Persistence and transactions

Production stores bytes in a private Supabase Storage bucket and metadata in
PostgreSQL. Mutable commands use version-checked writes. In-memory adapters are
test-only fakes.

## Data classification

Raw bytes may be public, private, or sensitive. Bytes, checksums, and storage
keys must not be logged together.

## Retention and erasure

Delete creates a durable tombstone and removes the Storage object. Failed
external removals remain pending and are retried after runtime restart.

## Events and failure behavior

Technical media events remain planned. Hashing or persistence failure aborts
the command before a reference is returned.

## Official sources

Not applicable; this is a technical capability governed by
[ADR-0003](../../../../../../docs/architecture/decisions/ADR-0003-in-memory-event-and-policy-runtime.md).

## Exceptions

There is no CDN or malware scanner.
