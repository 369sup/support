# Scheduled Commands Bounded Context

- **Catalog path:** `platform/scheduled-commands`
- **Kind:** `technical`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `not-applicable`

## Purpose

Reliably release context-owned commands at or after their due time without
centralizing the product rule that chose the deadline.

## Context content tree

- `platform/scheduled-commands` [active]
  - Durable command scheduling [active]
    - Use case: `schedule-command`
    - Owned concept: `ScheduledCommand`
  - Multi-instance delivery [active]
    - Use case: `claim-due-scheduled-commands`
    - Use case: `complete-scheduled-command`
    - Use case: `fail-scheduled-command`
    - Use case: `reconcile-expired-command-leases`
    - Owned concepts: `ScheduledCommandLease`,
      `ScheduledCommandAttempt`, `ScheduledCommandDeadLetter`
  - Published events
    - `ScheduledCommandCompleted@1` [planned]
    - `ScheduledCommandDeadLettered@1` [planned]
- External relationships
  - Runtime dependencies: none.
  - Planned relationships: none.
- Explicit exclusions
  - `ProductExpirationPolicy`
  - `ProductCommandMeaning`
  - `SourceContextReadValidation`
  - `CrossContextTransaction`

## Designed use cases

### `schedule-command` [active]

- **Type:** `command`
- **Application boundary:** `ScheduleCommandUseCase.scheduleCommand()`
- **Public entrypoint:** `server-api.ts#scheduleCommand`
- **Input:** Stable command ID, owner context, command name, opaque payload, due time, and maximum attempts.
- **Success result:** `scheduled` or idempotent `already-scheduled`.
- **Expected rejections:** `invalid-command`, `schedule-conflict`
- **Authorization:** Trusted server composition only; the owner context authorizes the product action before scheduling.
- **Transaction:** One context-local scheduled-command insert.
- **Idempotency:** Command ID is the idempotency key; a different schedule under the same ID conflicts.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Due time is stored exactly; execution at the exact millisecond is not guaranteed.

### `claim-due-scheduled-commands` [active]

- **Type:** `command`
- **Application boundary:** `ClaimDueScheduledCommandsUseCase.claimDueScheduledCommands()`
- **Public entrypoint:** `server-api.ts#claimDueScheduledCommands`
- **Input:** Worker ID, bounded batch size, and lease duration.
- **Success result:** `claimed` with zero or more leased commands.
- **Expected rejections:** `invalid-claim`
- **Authorization:** Trusted worker only.
- **Transaction:** Due commands are selected and leased atomically with non-blocking row locks.
- **Idempotency:** At-least-once; an expired lease can be reconciled and claimed again.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Batch size is limited to 100 and attempt count increases on each claim.

### `complete-scheduled-command` [active]

- **Type:** `command`
- **Application boundary:** `CompleteScheduledCommandUseCase.completeScheduledCommand()`
- **Public entrypoint:** `server-api.ts#completeScheduledCommand`
- **Input:** Command ID, lease worker ID, and expected version.
- **Success result:** `completed`.
- **Expected rejections:** `command-not-found`, `lease-mismatch`, `version-conflict`
- **Authorization:** The current lease worker only.
- **Transaction:** One compare-and-set lifecycle transition.
- **Idempotency:** Repeated completion with a stale version returns a version conflict.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Completion records no product outcome payload.

### `fail-scheduled-command` [active]

- **Type:** `command`
- **Application boundary:** `FailScheduledCommandUseCase.failScheduledCommand()`
- **Public entrypoint:** `server-api.ts#failScheduledCommand`
- **Input:** Command ID, lease worker ID, expected version, controlled error code, and retry time.
- **Success result:** `retry-scheduled` or `dead-lettered`.
- **Expected rejections:** `command-not-found`, `invalid-failure`, `lease-mismatch`, `version-conflict`
- **Authorization:** The current lease worker only.
- **Transaction:** One compare-and-set retry or dead-letter transition.
- **Idempotency:** Expected version prevents duplicate failure application.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Reaching maximum attempts dead-letters the command.

### `reconcile-expired-command-leases` [active]

- **Type:** `command`
- **Application boundary:** `ReconcileExpiredCommandLeasesUseCase.reconcileExpiredCommandLeases()`
- **Public entrypoint:** `server-api.ts#reconcileExpiredCommandLeases`
- **Input:** Bounded reconciliation limit.
- **Success result:** `reconciled` with reset and dead-letter counts.
- **Expected rejections:** `invalid-limit`
- **Authorization:** Trusted worker only.
- **Transaction:** Expired leases are selected and transitioned with non-blocking row locks.
- **Idempotency:** A lease is reconciled only while expired and leased.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `not-applicable`
- **Local policy:** Source contexts still validate expiration at read time.

## Ubiquitous language

- **Scheduled command:** Opaque instruction owned and interpreted by its source
  context.
- **Lease:** Temporary exclusive delivery claim.
- **Attempt:** One claim for at-least-once delivery.
- **Dead letter:** Command that exhausted automatic attempts.

## Ownership and invariants

The context owns scheduling and delivery state only. It never decides whether
an invitation, session, retention record, or other product object has expired.
Each command ID identifies exactly one immutable owner/name/payload schedule.

## Public capabilities

`server-api.ts` exposes the five application operations to trusted server
composition. No browser contract is exported.

## Dependencies and consistency

There are no bounded-context runtime dependencies. Callers pass opaque payloads
and interpret them after a lease is claimed.

## Authorization

Only trusted server composition and workers call this context. The source
context authorizes the original product decision and the receiving worker must
re-authorize any protected mutation before applying it.

## Persistence and transactions

PostgreSQL is the production adapter; an in-memory adapter supports development
and tests. Claim and reconciliation use `FOR UPDATE SKIP LOCKED`. Completion
and failure require worker and version matches. No provider call occurs while a
database lock is held.

## Data classification

Command payload is internal and may contain only the minimum identifiers needed
by the receiving context. Credentials, tokens, raw request bodies, and
unreviewed personal data are prohibited.

## Retention and erasure

Completed and dead-lettered commands remain until an operator-owned retention
job is defined. Source-context erasure must remove or redact its outstanding
commands through a later explicit operation.

## Events and failure behavior

Delivery is at-least-once. A worker failure leaves a lease that reconciliation
can release. Controlled failures retry until maximum attempts, then dead-letter.
Technical completion/dead-letter events remain planned and are not claimed as
published.

## Official sources

Not applicable to this technical context.

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json)
remains authoritative.
