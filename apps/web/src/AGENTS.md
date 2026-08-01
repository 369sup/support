# Web Source Architecture Contract

This file governs `apps/web/src/**` and inherits the web-package contract.
Architecture definitions remain authoritative in
[`docs/architecture/architecture.md`](../../../docs/architecture/architecture.md);
this file turns the source-root rules into placement and review steps.

## Fixed source shape

`apps/web/src` contains only:

```text
src/
|-- app/       # Next.js App Router delivery and framework binding
`-- modules/   # Product and technical bounded contexts
```

`AGENTS.md` is the instruction-file exception at this root.

- Do not add top-level `components`, `lib`, `shared`, `common`, `utils`,
  `services`, `features`, `hooks`, or `styles` directories.
- `app/` owns URLs, layouts, metadata, request parsing, framework lifecycle,
  and route-level composition.
- `modules/` owns product capabilities, use cases, policies, ports, adapters,
  feature UI, and context composition.
- Reusable business-free technical capabilities belong in `packages/**`, not
  in a third source root.

Next.js permits several organization and colocation strategies; this strict
two-root split is an intentional repository constraint, not a claim that the
framework requires it.

## Placement decision

Before creating or moving source, classify it:

1. If it exists because Next.js recognizes the file or binds an HTTP/URL
   concern, place it in `app/` and follow `app/AGENTS.md`.
2. If it implements product or technical capability behavior, place it in the
   owning bounded context and follow `modules/AGENTS.md`.
3. If it is reusable, business-free infrastructure or UI, place it in the
   owning workspace package.
4. If none applies, stop and resolve ownership instead of creating a generic
   shared directory.

## Dependency direction

- `app` may import a module only through that bounded context's public
  boundary entrypoint.
- A module must never import `app`.
- Cross-context imports must use declared public entrypoints and an authorized
  dependency from the module catalog.
- Consumers import workspace packages through package exports, never through
  `packages/*/src`.
- Keep the graph acyclic. Do not use barrels, aliases, registries, or dynamic
  imports to hide a forbidden dependency.

## Naming baseline

- Directories and source filenames use lowercase kebab-case unless Next.js
  requires an exact reserved name.
- Classes and types use PascalCase. Functions and variables use camelCase.
- Boolean names start with a predicate such as `is`, `has`, `can`, `should`,
  `was`, or `did`.
- Do not use bare role names such as `utils`, `helpers`, `common`, `shared`,
  `service`, `manager`, `processor`, `types`, `models`, `interfaces`,
  `handlers`, or `constants`.
- Use named exports for project code. Use a default export only where an
  official Next.js file convention requires it.

The complete role suffixes, public entrypoint names, and module layer names are
owned by the architecture contract and specialized by `modules/AGENTS.md`.

## Server and client boundary

- Treat Server Components as the default.
- Add `"use client"` only at the smallest interactive boundary. It makes the
  file and its transitive imports part of the client module graph.
- Before exposing browser code, inspect the full import chain for Node APIs,
  server-only state, secrets, and unprefixed environment variables.
- Data passed from a Server Component to a Client Component must be
  serializable.

## TypeScript and implementation baseline

The detailed TypeScript contract remains authoritative in
[`docs/architecture/architecture.md`](../../../docs/architecture/architecture.md#typescript-contract).
For source changes:

- Keep strict compiler settings enabled. Use `unknown`, narrowing, runtime
  validation, generics, and discriminated unions instead of `any`, unchecked
  assertions, non-null assertions, or compiler suppressions.
- Give public entrypoints and trust boundaries explicit input, output, and
  failure types. Keep private types beside their owner and export only a type
  with more than one legitimate boundary consumer.
- Model finite state and expected failure with literal or discriminated unions,
  and handle them exhaustively. Do not parse error-message strings or combine
  mutually exclusive states as unrelated booleans.
- Use readonly contracts for values that are not intentionally mutable.
  Important domain values such as money, units, dates, time zones, and
  durations must carry their meaning instead of using ambiguous naked numbers
  or strings.
- Keep functions single-purpose and names intention-revealing. Prefer pure
  functions for stateless transformation; use a class only to protect state,
  invariants, or polymorphism.

## React and interaction baseline

- Components own presentation and interaction, not business policy,
  persistence, authorization, or application orchestration.
- Keep state with the lowest common owner. Derive values during render instead
  of mirroring props or query results in state; use an Effect only to
  synchronize with an external system.
- Use semantic HTML first. Every interactive control must support keyboard use,
  visible focus, an accessible name, and non-color-only status communication.
- Forms provide client-side feedback and repeat authoritative validation on
  the server. Loading, empty, success, and failure states must reflect observed
  backend results; the UI must not assume a mutation succeeded.
- Optimistic updates require an explicit rollback and conflict strategy.
  Stable domain identifiers are used as list keys when items can change order.
- Keep browser payloads and client dependencies minimal. Measure before
  optimizing, record the bundle effect of a new client dependency, and do not
  move server-only work into the browser to avoid a clear server query.

## Async and test baseline

- Every asynchronous operation handles success and failure and, where the
  boundary supports them, cancellation and timeout. Bound parallel work over
  large collections and release timers, subscriptions, streams, and
  connections when their owner ends.
- Tests describe condition, behavior, and expected outcome. Do not test private
  methods or write assertions solely to raise coverage.
- Keep tests deterministic by controlling time, randomness, network, storage,
  and global state. A source-level bug fix includes a focused regression test.

## Verification

For every source change, inspect placement, import direction, exported surface,
client reachability, and the actual diff. Run focused tests first, then
`pnpm typecheck`, `pnpm lint`, `pnpm architecture`, and `pnpm check` when the
affected scope justifies them.

## Official framework basis

- <https://nextjs.org/docs/app/getting-started/project-structure>
- <https://nextjs.org/docs/app/getting-started/server-and-client-components>
