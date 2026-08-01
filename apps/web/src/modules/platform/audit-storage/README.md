# Audit Storage Bounded Context

- **Catalog path:** `platform/audit-storage`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `not-applicable`

## Purpose

Store immutable, scope-indexed audit records, create simulated exports, and
apply idempotent retention executions. The current adapter is process-local
and does not claim durable production storage.

## Context content tree

- Audit storage [active]
  - `append-audit-record`
  - `query-audit-records`
  - `create-audit-export`
  - `apply-audit-retention`
- Owned concepts
  - `AuditStorageRecord`
  - `AuditExportJob`
  - `RetentionExecution`
- Published events
  - `AuditRecordStored@1` [planned]
  - `AuditStorageExportCompleted@1` [planned]
  - `AuditRetentionApplied@1` [planned]
- Runtime dependencies: none.
- Explicit exclusions
  - `AuditEventMeaning`
  - `AuditAuthorization`
  - `ProductActivityFeed`

## Designed use cases

### `append-audit-record` [active]

- **Type:** `command`
- **Application boundary:** `AppendAuditRecordUseCase.appendAuditRecord()`
- **Public entrypoint:** `server-api.ts#appendAuditRecord`
- **Input:** An immutable record ID, scope, actor, target, occurrence time,
  action, and scalar metadata.
- **Success result:** `stored` or the idempotent `already-stored`.
- **Expected rejections:** `record-conflict`, `sensitive-metadata-key`
- **Authorization:** Internal audited-event consumer only; it does not grant
  product access or decide who may read audit records.
- **Transaction:** One immutable audit record insert.
- **Idempotency:** The same record ID and value is accepted once; a different
  value under the same ID conflicts.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Metadata keys that imply credentials, cookies, passwords,
  secrets, or tokens are rejected before persistence.

### `query-audit-records` [active]

- **Type:** `query`
- **Application boundary:** `QueryAuditRecordsUseCase.queryAuditRecords()`
- **Public entrypoint:** `server-api.ts#queryAuditRecords`
- **Input:** An authoritative scope with optional actor, target, and bounded
  result limit.
- **Success result:** Newest-first audit records for the requested scope.
- **Expected rejections:** `none`
- **Authorization:** The delivery caller must authorize the requested scope;
  this technical context does not own product audit permissions.
- **Transaction:** Read-only.
- **Idempotency:** Repeated queries over the same state are stable.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** The query never crosses the requested scope and caps results
  at 500.

### `create-audit-export` [active]

- **Type:** `command`
- **Application boundary:** `CreateAuditExportUseCase.createAuditExport()`
- **Public entrypoint:** `server-api.ts#createAuditExport`
- **Input:** An authoritative account, organization, enterprise, or repository
  scope.
- **Success result:** `completed` with an opaque export reference, checksum,
  and record count.
- **Expected rejections:** `none`
- **Authorization:** Internal delivery orchestration must authorize the scope
  before invoking this command.
- **Transaction:** One export-job record after reading the scoped snapshot.
- **Idempotency:** Each request creates a distinct export job.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** The simulated exporter does not create a file or contact an
  external service.

### `apply-audit-retention` [active]

- **Type:** `command`
- **Application boundary:** `ApplyAuditRetentionUseCase.applyAuditRetention()`
- **Public entrypoint:** `server-api.ts#applyAuditRetention`
- **Input:** A stable execution ID and exclusive ISO timestamp cutoff.
- **Success result:** `applied` or idempotent `already-applied` with the removed
  record count.
- **Expected rejections:** `execution-conflict`
- **Authorization:** Internal retention scheduler only.
- **Transaction:** Remove qualifying records and persist one execution receipt
  in the same context-local adapter.
- **Idempotency:** Reusing an execution ID with the same cutoff returns the
  receipt; a different cutoff conflicts.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Export jobs and retention receipts are not removed by an
  audit-record retention execution.

## Ubiquitous language

- **Audit storage record:** Immutable technical representation of an already
  approved auditable event.
- **Export job:** Metadata-only receipt for a simulated scoped export.
- **Retention execution:** Idempotency receipt for one cutoff application.

## Ownership and invariants

This context owns storage records, export receipts, and retention receipts. It
does not define product event meaning, decide audit authorization, or build the
activity feed. Record IDs and retention execution IDs are conflict-detecting
idempotency keys.

## Public capabilities

Internal consumers append and query audit records, produce metadata-only
export receipts, and apply retention. Public integration references omit
stored metadata.

## Dependencies and consistency

There are no runtime context dependencies. Governance consumers deliver
approved audit records after their source transaction commits, so audit
storage is eventually consistent with product commands.

## Authorization

No browser route is active. Each delivery adapter must authorize account,
organization, enterprise, or repository scope before calling a query or
export. Audit storage never infers authorization from record presence.

## Persistence and transactions

The active adapter uses versioned, injectable, process-local Maps. Records are
immutable version 1 values. Process restart removes records, export jobs, and
retention receipts.

## Data classification

Actor and target IDs can be personal or tenant-scoped identifiers. Metadata is
restricted to scalar values and rejects sensitive key names. Callers must
minimize personal data and never include credentials, raw cookies, secrets, or
tokens.

## Retention and erasure

Retention removes records strictly older than the cutoff and records an
idempotent execution receipt. Durable retention scheduling, legal hold, and
erasure policy remain outside this in-memory slice.

## Events and failure behavior

Audit storage technical events remain planned. Conflicts and sensitive
metadata are explicit results; failed validation does not mutate storage.
Export is simulated and has no external side effect.

## Official sources

Not applicable; this is a technical capability governed by
[ADR-0003](../../../../../../docs/architecture/decisions/ADR-0003-in-memory-event-and-policy-runtime.md).

## Exceptions

The in-memory adapter is non-durable, single-process, and
restart-invalidated. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json)
remains authoritative.
