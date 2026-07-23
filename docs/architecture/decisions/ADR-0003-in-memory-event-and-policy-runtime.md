# ADR-0003: Define the in-memory event, policy, and integration runtime

- **Status:** Accepted
- **Decision date:** 2026-07-23
- **Supersedes:** none
- **Superseded by:** none

## Context

The remaining product catalog adds commands, asynchronous projections,
authorization policies, commercial entitlements, and integrations. Those
capabilities must remain independently owned while the development and E2E
runtime is process-local and non-durable. Direct cross-context writes,
provider calls from domain commands, or a shared application database would
erase the transaction and ownership boundaries needed for later durable
adapters.

Enterprise and organization custom properties also have a two-way promotion
workflow. Direct synchronous dependencies in both directions would make the
context graph cyclic.

## Decision

Each command commits one context-local, version-checked state transition and
records its versioned event envelope in the same context-owned outbox. The
technical `platform/event-publication` context leases and dispatches committed
envelopes, tracks retry and dead-letter state, and supports idempotent
redelivery. A publication failure never rolls back the source command.
Projections persist their own cursor and are eventually consistent; they never
replace an authoritative domain or authorization decision.

Repository decisions compose in this order:

1. resource existence and lifecycle;
2. owner, direct, base-permission, team, and role grants;
3. enterprise and organization policy restrictions;
4. feature entitlement;
5. final operation decision.

Grants can add capability. Policies can only narrow capability. Entitlements
decide whether the purchased product includes a feature and are not reported
as actor authorization.

External IAM, payment, notification, OAuth, App, and webhook effects use
deterministic simulated adapters in the in-memory runtime. Secrets and raw
tokens are never returned by read models, logged, or committed as fixtures.

Custom-property promotion is an app-delivery orchestration: read a public
source-definition snapshot, execute the target context command, then record an
idempotent acknowledgement. Neither context imports the other's storage, and
the orchestration is not a cross-context transaction.

## Consequences

The runtime remains single-process, restart-invalidated, and unsuitable for
production durability or horizontal scaling. Failed dispatch and projections
are observable and retryable without weakening the successful source command.
Cross-context consumers must tolerate duplicates, delay, and stale references.
Replacing the in-memory adapters later must preserve these public contracts and
ordering rules.
