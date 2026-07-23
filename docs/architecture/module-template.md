# Bounded Context Template

This file owns the human-maintained context README schema and activation
workflow. Global source, dependency, naming, data, authorization, composition,
observability, and testing rules live in
[`architecture.md`](architecture.md).

Every catalog context has exactly one design README at
`apps/web/src/modules/<subdomain>/<bounded-context>/README.md`. Use
`pnpm architecture:contexts` only to scaffold a missing README; the command
never overwrites an existing semantic model.

## Lifecycle and source shape

A planned context directory contains `README.md` only. Source files, layers,
fixtures, local agent instructions, and public entrypoints require:

1. a complete context design;
2. at least one approved `[active]` designed use case;
3. matching `activationScope`;
4. active runtime dependency targets; and
5. `implementationStatus: "active"` in `module-map.json`.

Create only the layers needed by active use cases:

```text
apps/web/src/modules/<subdomain>/<bounded-context>/
├─ README.md
├─ server-api.ts              # optional server facade
├─ browser-ui.ts              # optional browser-safe facade
├─ server-actions.ts          # optional Server Actions facade
├─ integration-contracts.ts   # optional framework-free contracts
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

At least one public entrypoint must expose a capability with a real consumer.
Entrypoints explicitly name their exports and follow the boundary contracts in
`architecture.md`.

## Required README decisions

Every planned context README uses this minimum second-level heading set:

```markdown
## Purpose
## Context content tree
## Designed use cases
## Ownership and invariants
## Dependencies and consistency
## Official sources
## Exceptions
```

Existing planned READMEs may retain additional reviewed sections. They are
valid supersets and are not rewritten merely to match the minimum template.

Every active context README uses the complete decision set:

```markdown
## Purpose
## Context content tree
## Designed use cases
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

The context content tree organizes business purpose into capabilities, use
cases, owned concepts, rules, decisions, events, external relationships, and
explicit exclusions. Mark each capability `active` or `planned`.

The tree references every catalog `activationScope`, owned concept, and active
published event as `EventName@version`. Overlapping activation scopes,
ownership, exclusions, relationships, and events must agree with
`module-map.json`; the README may add human explanation that does not belong in
the machine catalog.

## Designed use cases

`## Designed use cases` is the only approved application-boundary contract.
Drafts remain outside it. Use `[planned]` for an approved design without source
implementation and `[active]` for an implemented design.

When no design is approved, use exactly:

```text
No approved use cases. Implementation remains blocked.
```

Each approved use case uses this shape:

```markdown
### `<use-case-kebab-case>` [planned|active]

- **Type:** `command` | `query`
- **Application boundary:** `<PascalCaseUseCase>.<camelCaseOperation>()`
- **Public entrypoint:** `<entrypoint>.ts#<camelCaseOperation>`
- **Input:** <complete input contract>
- **Success result:** <complete success contract>
- **Expected rejections:** `none` | `<named-rejection>`, ...
- **Authorization:** <policy owner and resource scope, or `none` for public data>
- **Transaction:** <transaction and consistency boundary>
- **Idempotency:** <idempotency boundary or query rationale>
- **Dependencies:** `none` | `<context>::<contract>`, ...
- **Published events:** `none` | `<EventName>@<version>`, ...
- **Official evidence:** `<catalog-source-id>` | `not-applicable`
- **Local policy:** <explicit local decisions or `none`>
```

Every field is required and non-empty. Product contexts reference cataloged
official source IDs; technical contexts use `not-applicable`. Dependencies and
events must already exist in the catalog. The active designed-use-case set
equals `activationScope`, and source code is prohibited for a `[planned]`
design.

The thirteen fields above are required for approved designed-use-case entries.
The remaining active-only README headings become mandatory when the context is
activated; a planned context does not need placeholder authorization,
persistence, retention, or failure decisions before a use case is approved.

Authorization records the actor source, resource or tenant scope, policy owner,
and denial model when protection is required. Persistence records data and
migration ownership, transaction scope, cross-context consistency, and
idempotency. Events record delivery, ordering, retry, outbox, and consumer
failure behavior where applicable.

## Events and public contracts

Every catalog event declares `implementationStatus` as `planned` or `active`.
Activate only events emitted by an implemented activation scope. Query-only
scopes may have no active events.

An active event is explicitly exported from `integration-contracts.ts`; its
catalog entry names the exported schema and ordering key. Runtime event
dependencies select only active events. Planned relationships document future
semantics but do not authorize handlers or source imports.

Public entrypoints expose only boundary facades:

- `server-api.ts`: server-side inbound operations;
- `browser-ui.ts`: browser-safe UI and contracts;
- `server-actions.ts`: explicit Next.js Server Actions; and
- `integration-contracts.ts`: framework-free dependency contracts and events.

Composition roots, domain objects, handlers, ports, outbound adapters, ORM
records, provider types, and internal persistence records remain private.
