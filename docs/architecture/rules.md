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
- **ARCH-DEP-010:** A cross-context import must target a public entrypoint and
  the importing context must declare a synchronous dependency on the target in
  `module-map.json`. Event dependencies do not authorize source imports.
- **ARCH-DEP-011:** Adapters and composition follow the complete local layer
  matrix: inbound adapters may depend on application and contracts; outbound
  adapters may depend on outbound ports, domain, and contracts; composition may
  wire application, adapters, and contracts. Inbound and outbound adapters do
  not depend on each other directly.
- **ARCH-DEP-012:** Static imports, re-exports, and string-literal dynamic
  imports receive the same boundary checks. Variable dynamic imports,
  `export *`, and CommonJS `require()` remain prohibited.
- **ARCH-DEP-013:** A `plannedRelationships` entry documents a future product
  relationship only. It does not authorize imports or runtime event handling;
  move the relationship to `dependencies` when its activation scope is
  implemented and both contexts are active.
- Workspace packages are imported only through declared package subpath
  exports; consumers never import `packages/*/src`.
- **ARCH-GRAPH-001:** Source dependencies must be acyclic.
- **ARCH-CLIENT-001:** A client entrypoint must not transitively reach
  application, composition, outbound adapters, Node APIs, secrets, or
  `process.env`.
- **ARCH-API-005:** Public entrypoints expose only boundary-specific facades,
  UI, actions, or integration contracts. They never expose aggregates,
  entities, handlers, ports, outbound adapters, ORM records, provider types,
  or composition roots.

## Product catalog

- **ARCH-MAP-013:** `module-map.json` uses catalog version 6 and every context
  declares a valid kind, maturity, implementation status, responsibility, ownership,
  exclusions, activation scope, runtime dependencies, planned relationships,
  semantic claims, and source list. Domain contexts also declare a
  core or supporting classification. Source freshness is derived from source
  check dates; semantic status is declared independently as candidate,
  validated, or not applicable.
- **ARCH-MAP-014:** Domain and projection sources use HTTPS under
  `docs.github.com/en/` and state the product semantics they support. Technical
  contexts have no GitHub product sources.
- **ARCH-MAP-015:** Every declared dependency targets an existing context, is
  unique and non-self-referential, uses a named contract, and declares either
  synchronous or event mode. Domain contexts never depend on projections.
- **ARCH-MAP-016:** Excluded and deferred capabilities have unique names and do
  not appear as bounded contexts. Deferred capabilities identify the missing
  prerequisite that prevents activation.
- **ARCH-MAP-017:** Every official product source has a stable ID and a truthful
  ISO verification date or `null`. Active stable contexts reject sources older
  than 365 days; active preview contexts reject sources older than 90 days.
- **ARCH-MAP-018:** Every context declares versioned published events or an
  empty-catalog rationale. Event dependencies name events and versions owned by
  their target context.
- **ARCH-MAP-019:** Every active context README contains the canonical decision
  headings from `module-template.md`; planned contexts do not receive source
  directories or placeholder READMEs.
- **ARCH-MAP-020:** Every active event names an exported
  `integration-contracts.ts` schema and a non-empty ordering key. Planned events
  omit contract metadata until activation.
- **ARCH-MAP-021:** Every active domain or projection context has validated
  product semantics in addition to fresh official sources. A fresh source date
  does not by itself validate ownership, dependencies, or behavior.
- **ARCH-MAP-022:** Every runtime dependency of an active context targets an
  active context. Relationships that are not implemented remain in
  `plannedRelationships`.
- **ARCH-MAP-023:** Every active context declares at least one unique kebab-case
  activation scope. Planned contexts have an empty activation scope.
- **ARCH-MAP-024:** Every owned semantic in a validated context is covered by a
  stable semantic claim that names exact official source IDs.
- **ARCH-MAP-025:** Every published event in a validated context is covered by
  a semantic claim using its exact event name and version.
- **ARCH-MAP-026:** Every catalog event declares `implementationStatus` as
  `planned` or `active`. Planned contexts cannot publish active events, while
  active contexts may mix planned and active events or publish none for a
  query-only activation scope. Planned events never declare schema or ordering
  metadata.
- **ARCH-DEP-014:** Runtime event dependencies consume only active events from
  active contexts. Planned relationships may reference planned or active events
  without authorizing runtime handling.
- **ARCH-GUIDE-001:** Repository `AGENTS.md` files have resolvable local links;
  permanent `AGENTS.override.md` files are prohibited.
- **ARCH-MEM-001:** Committed Serena shared memories are deterministic,
  read-only generated projections of an explicit authority allowlist. Local
  writable memories are ignored by Git.

## Responsibilities and boundaries

- One ordinary module file has one primary runtime export and one architecture
  role. Root public entrypoints may explicitly re-export several symbols.
- **ARCH-USECASE-001:** Every active domain or projection semantic maps each
  `activationScope` to a same-named inbound use-case port, command/query
  handler, and camelCase operation. For example,
  `identity/accounts` -> `get-personal-account-by-username` ->
  `GetPersonalAccountByUsernameUseCase.getPersonalAccountByUsername()`.
  Generic application operations such as `execute`, `handle`, `process`, and
  `run` are prohibited because they erase use-case identity.
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
- A source context writes its persistence changes and local outbox envelope in
  the same transaction. Event dispatch, leasing, retry, redelivery, and
  dead-letter handling occur after commit and do not own the source outbox row.
- Catalog dependencies describe product or bounded-context semantics. Database,
  message transport, framework wiring, and other adapter-only relationships do
  not become synchronous catalog dependencies.
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
