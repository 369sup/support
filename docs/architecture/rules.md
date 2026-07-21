# Architecture Rules

This file is the canonical human-readable architecture contract. Mechanical
checks emit the stable rule IDs listed here. `AGENTS.md` files explain workflow
and ownership but must not redefine these rules.

## Source roots

- **ARCH-SRC-001:** `apps/web/src` contains directories `app` and `modules` only.
- **ARCH-TOOL-001:** Code generators must target the canonical app/module
  locations and must not recreate forbidden source roots.
- `apps/web/src/app` owns App Router delivery, route composition, metadata, request
  binding, and route-specific presentation.
- `apps/web/src/modules/<subdomain>/<bounded-context>` owns product or technical
  capabilities. Both names use lowercase kebab-case.
- Do not add global `components`, `lib`, `shared`, `common`, or `utils` roots.
- Reusable business-free UI lives in `packages/shadcn`; official registry
  source and custom product-agnostic composition remain distinct.
- **ARCH-STRUCT-001..003:** Module, subdomain, and context roots may contain
  only their documented files, bounded contexts, public entrypoints, and
  canonical architecture layers.

## Dependency direction

- **ARCH-DEP-001:** App code imports a context through `server-api.ts`,
  `browser-ui.ts`, `server-actions.ts`, or `integration-contracts.ts` only.
- **ARCH-DEP-002:** Modules never import `apps/web/src/app`.
- **ARCH-DEP-003:** Cross-context imports use public root entrypoints only.
- **ARCH-DEP-004:** Domain imports only the same context's domain layer.
- **ARCH-DEP-005:** Application imports only the same context's application
  and domain layers.
- **ARCH-DEP-006:** Domain and application have no direct external package
  dependencies. Required capabilities are represented by ports.
- **ARCH-DEP-007:** Client Components use `browser-ui.ts` for browser-safe code
  and `server-actions.ts` only for explicit Server Actions.
- **ARCH-DEP-008:** Contracts remain framework-free and do not expose domain
  objects, handlers, adapters, ORM records, or provider types.
- **ARCH-DEP-009:** Imports inside one bounded context use relative paths.
- Workspace packages are imported only through declared package subpath
  exports; consumers never import `packages/*/src`.
- **ARCH-GRAPH-001:** Source dependencies must be acyclic.
- **ARCH-CLIENT-001:** A client entrypoint must not transitively reach
  application, composition, outbound adapters, Node APIs, secrets, or
  `process.env`.

## Responsibilities and boundaries

- One ordinary module file has one primary runtime export and one architecture
  role. Root public entrypoints may explicitly re-export several symbols.
- Domain behavior is deterministic. Time, IDs, randomness, environment,
  network, filesystem, and storage arrive as explicit values or ports.
- Application handlers coordinate one command or query. They do not contain
  core invariants or return framework, ORM, or provider objects.
- Inbound adapters validate transport input and translate results. Outbound
  adapters implement ports and isolate technology-specific errors.
- Mappers are pure boundary conversions; they do not validate business rules,
  query storage, or cause side effects.
- Composition selects concrete adapters and contains no business rules.

## Consistency rules

- Expected business rejection uses a named discriminated result such as
  `{ ok: true, value } | { ok: false, error }`. Exceptions represent unexpected
  or infrastructure failure only.
- Repository absence is represented consistently by an explicit result or
  documented nullable return; do not interchange `null`, `undefined`, and
  exceptions for the same operation.
- Keep one transaction inside one bounded context and one command by default.
  Cross-context consistency is explicit and normally event-driven.
- Each boundary owns its mapping. Domain objects, ORM records, transport DTOs,
  and provider responses are distinct types.
- A new pattern must first be added to the canonical template and mechanical
  rules. Do not infer a standard from a single legacy file or exception.

## Tests

- Domain unit tests have no framework or infrastructure.
- Application tests use fakes for outbound ports.
- Adapters have integration or contract tests appropriate to their boundary.
- Architecture rules have positive and negative fixtures.
- A change is complete only after the relevant tests and `pnpm check` pass.
