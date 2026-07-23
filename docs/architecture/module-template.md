# Bounded Context Template

Every catalog context owns a human-maintained design README at
`apps/web/src/modules/<subdomain>/<bounded-context>/README.md`, including
planned contexts. Use `pnpm architecture:contexts` to scaffold only missing
READMEs; the command never overwrites an existing semantic model.

A planned context directory contains `README.md` only. Add source files,
layers, and public entrypoints only after its `module-map.json`
`implementationStatus` changes from `planned` to `active`. At activation,
declare the implemented use cases in `activationScope` and move only their
implemented relationships from `plannedRelationships` to `dependencies`.
Runtime dependencies require active target contexts; planned relationships do
not authorize imports or event handlers.

```text
apps/web/src/modules/<subdomain>/<bounded-context>/
├─ README.md
├─ server-api.ts              # optional server public API
├─ browser-ui.ts              # optional browser-safe public API
├─ server-actions.ts          # optional Server Actions API
├─ integration-contracts.ts   # optional framework-free contract API
├─ domain/
├─ application/
│  ├─ commands/
│  ├─ queries/
│  └─ ports/
│     ├─ inbound/
│     └─ outbound/
├─ contracts/
├─ adapters/
│  ├─ inbound/
│  └─ outbound/
├─ composition/
└─ tests/
```

At least one public entrypoint must exist and must expose only capabilities
that have a real consumer. Public entrypoints explicitly name every export.

## Semantic to use-case to function mapping

Each active `activationScope` has one traceable application chain:

```text
semantic context
  -> kebab-case activationScope
  -> PascalCase inbound UseCase port
  -> camelCase business function
  -> command/query Handler implementation
```

For `get-personal-account-by-username`, create
`GetPersonalAccountByUsernameUseCase.getPersonalAccountByUsername()` and let
`GetPersonalAccountByUsernameHandler` implement that port. Do not use generic
handler operations such as `execute`, `handle`, `process`, or `run`.

## Required README decisions

Every active context README uses these exact second-level headings so the
decisions remain discoverable and mechanically verifiable:

```markdown
## Purpose
## Context content tree
## Ubiquitous language
## Ownership and invariants
## Public capabilities
## Dependencies and consistency
## Authorization
## Persistence and transactions
## Data classification
## Retention and erasure
## Events and failure behavior
## Official sources
## Exceptions
```

The context content tree is the human-readable semantic model for the bounded
context. Organize it from business purpose to capabilities, then trace each
capability to its use cases, owned concepts, rules and invariants, decisions,
and published events. Mark every capability as `active` or `planned` and keep
planned behavior distinct from implemented behavior.

The tree must reference every catalog `activationScope` and owned concept using
inline code. It must also reference every active published event as
`EventName@version`. Supporting concepts, external relationships, and explicit
exclusions belong in the same tree when they clarify the boundary.

```text
Bounded context purpose
├─ Capability [active|planned]
│  ├─ Use cases
│  ├─ Owned domain concepts
│  ├─ Business rules and invariants
│  ├─ Decisions or results
│  └─ Published events
├─ Supporting concepts
├─ External relationships
└─ Explicit exclusions
```

`module-map.json` remains the machine-readable catalog and index. The context
README is the complete human-readable semantic model and may add capability
hierarchy, rules, invariants, and decisions that do not belong in the catalog.
Overlapping activation scopes, owned concepts, event versions, relationships,
and exclusions must agree.

The sections record owner and out-of-scope concerns, public commands and
queries, transaction ownership, resource scope, permission ports, sensitive
data handling, retention and redaction, delivery guarantees, idempotency,
ordering, retry, official `docs.github.com` evidence, and any active
`ARCH-EX-###` references.

Every catalog event declares `implementationStatus` as `planned` or `active`.
Activate only the events emitted by the implemented `activationScope`; leave
future events planned without schema or ordering metadata. Query-only scopes may
have no active events.

When a command publishes events, its persistence adapter writes the aggregate
changes and a context-local outbox envelope in the same transaction. The
platform publication capability may lease and dispatch committed envelopes,
but it does not own or write the source context's outbox row. Transport,
database, and framework wiring remain adapter concerns and are not catalog
dependencies unless they carry bounded-context semantics.

An active context must expose each active event type explicitly from
`integration-contracts.ts`. Its catalog entry uses
`integration-contracts.ts#ExportedType` and declares the event ordering key.
Runtime event dependencies may select only active events; planned relationships
may document future event selections without authorizing handlers.

## Public entrypoints

- `server-api.ts`: exposes explicit server-side inbound facades from
  `adapters/inbound/server`; composition remains private.
- `browser-ui.ts`: begins with `"use client"` and exposes browser-safe UI from
  `adapters/inbound/react` plus browser-safe contracts.
- `server-actions.ts`: begins with `"use server"` and exports async actions from
  `adapters/inbound/next/server-actions` only.
- `integration-contracts.ts`: exposes dependency-free types and events from
  `contracts` only.

No public entrypoint exports aggregates, entities, handlers, ports, outbound
adapters, persistence or provider records, or a composition root. A context
importing another context must declare the synchronous dependency in
`module-map.json`; an event dependency alone never permits a source import.
Each active product context also keeps its `semanticClaims` aligned with the
exact owned semantics and versioned events supported by official source IDs.

Business-free UI primitives are not a technical bounded context. They live in
`packages/shadcn/src/ui`, while product-agnostic compositions live in
`packages/shadcn/src/custom`. Product-aware components remain in the owning
bounded context's inbound adapter.
