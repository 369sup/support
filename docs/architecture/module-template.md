# Bounded Context Template

Create a context only after its `module-map.json` status changes from `planned`
to `active`. Do not create empty optional directories.

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

## Required README decisions

- Purpose, owner, ubiquitous language, and out-of-scope concerns.
- Aggregate and invariant ownership where domain behavior exists.
- Public commands, queries, results, and integration events.
- Upstream/downstream context relationships and consistency expectations.
- Persistence and transaction ownership.
- Official `docs.github.com` sources for GitHub product semantics.
- Any active `ARCH-EX-###` references. Exceptions are never examples.

## Public entrypoints

- `server-api.ts`: server-side facade and composition only.
- `browser-ui.ts`: begins with `"use client"` and exposes browser-safe UI or types.
- `server-actions.ts`: begins with `"use server"` and exports async actions only.
- `integration-contracts.ts`: exposes dependency-free cross-context contracts.

Business-free UI primitives are not a technical bounded context. They live in
`packages/shadcn/src/ui`, while product-agnostic compositions live in
`packages/shadcn/src/custom`. Product-aware components remain in the owning
bounded context's inbound adapter.
