# Architecture Contract

This file is the canonical human-readable architecture contract. The complete
machine-readable rule registry, enforcement owner, and gate live in
`@support/tooling/architecture/policy`; every emitted rule ID must be registered
there. `AGENTS.md` files explain workflow and ownership but must not redefine
these rules.

Code-level TypeScript style is enforced by the repository ESLint and TypeScript
configuration. This document records only rules that protect architecture,
runtime boundaries, data ownership, authorization, or operational safety.

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
- **ARCH-PKG-001..008:** Workspace manifests, package kinds, dependency
  sections, declared imports, explicit exports, source-root isolation, and the
  internal package graph follow the shared package policy. Packages never
  depend on applications, and consumers never import `packages/*/src`.
- **ARCH-GRAPH-001:** Source dependencies must be acyclic.
- **ARCH-CLIENT-001:** A client entrypoint must not transitively reach
  application, composition, outbound adapters, Node APIs, secrets, or
  `process.env`.
- **ARCH-API-005:** Public entrypoints expose only boundary-specific facades,
  UI, actions, or integration contracts. They never expose aggregates,
  entities, handlers, ports, outbound adapters, ORM records, provider types,
  or composition roots.

## Names and public interfaces

- Directories and source filenames use lowercase kebab-case.
- Classes and types use PascalCase; functions and variables use camelCase.
- Boolean names start with a predicate such as `is`, `has`, `can`, `should`,
  `was`, or `did`.
- Bare role names such as `utils`, `helpers`, `common`, `shared`, `service`,
  `manager`, `processor`, `types`, `models`, `interfaces`, `handlers`, and
  `constants` are prohibited.

| Role | Suffix | Required location |
| --- | --- | --- |
| Aggregate | `.aggregate.ts` | `domain/aggregates` |
| Entity | `.entity.ts` | `domain/entities` |
| Value object | `.value-object.ts` | `domain/value-objects` |
| Domain service | `.domain-service.ts` | `domain/services` |
| Policy | `.policy.ts` | `domain/policies` |
| Domain event | `.domain-event.ts` | `domain/events` |
| Domain error | `.domain-error.ts` | `domain/errors` |
| Inbound port | `.use-case.ts` | `application/ports/inbound` |
| Repository or gateway port | `.repository.port.ts`, `.gateway.port.ts` | `application/ports/outbound` |
| Adapter | `.adapter.ts` | `adapters` |
| Mapper | `.mapper.ts` | a boundary-local `mappers` directory |
| Command/query handler | `.handler.ts` | `application/commands` or `application/queries` |
| Next route handler | `.handler.ts` | `adapters/inbound/next/route-handlers` |

Every active application capability follows this naming chain:

```text
<subdomain>/<bounded-context>
  -> activationScope: <use-case-name>
  -> <UseCaseName>UseCase
  -> <useCaseName>()
  -> <use-case-name>.handler.ts
```

The only context-root entrypoints are `server-api.ts`, `browser-ui.ts`,
`server-actions.ts`, and `integration-contracts.ts`. Create only entrypoints
with a real consumer. `index.ts`, `client.ts`, `actions.ts`, `public.ts`,
`action.ts`, and `*.action.ts` are prohibited.

App-to-module and cross-context imports use the canonical
`@/modules/<subdomain>/<bounded-context>/<entrypoint>` path. Imports inside one
context use relative paths. Workspace packages use explicit package subpath
exports. Project code uses named exports, preserves exported names, and does
not use wildcard or multi-level barrel re-exports.

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
  ISO verification date or `null`. Active contexts require a non-null,
  non-future date.
- **ARCH-KNOWLEDGE-001:** Source-age governance reports stable sources older
  than 365 days and preview sources older than 90 days. This time-based
  knowledge check is scheduled and manually runnable, not a merge gate.
- **ARCH-MAP-018:** Every context declares versioned published events or an
  empty-catalog rationale. Event dependencies name events and versions owned by
  their target context.
- **ARCH-MAP-019:** Active context READMEs contain the complete canonical
  decision headings; planned contexts use the lifecycle-minimum heading set
  from `module-template.md`. Context trees reference catalog activation scopes,
  owned concepts, and published events. Designed use cases reference only
  cataloged sources, relationships, and events, and a planned tree never
  describes an active capability.
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
- **ARCH-MAP-027:** Every catalog context has exactly one human-maintained
  README under `apps/web/src/modules/<subdomain>/<bounded-context>/`. A planned
  context directory contains only that README; source files and architecture
  layers require activation.
- **ARCH-DEP-014:** Runtime event dependencies consume only active events from
  active contexts. Planned relationships may reference planned or active events
  without authorizing runtime handling.
- **ARCH-GUIDE-001:** Repository `AGENTS.md` files have resolvable local links;
  permanent `AGENTS.override.md` files are prohibited.
- **ARCH-GUIDE-002:** The generated-memory authority allowlist exactly matches
  repository guidance and is checked with generated artifacts.
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
- **ARCH-USECASE-002:** `## Designed use cases` is the sole approved
  application-boundary contract. Its `[active]` entries equal
  `activationScope`, use the derived UseCase interface and camelCase operation,
  match the command/query handler directory, and name a public entrypoint.
  `[planned]` entries have no handler or source implementation.
- **ARCH-USECASE-003:** Every named expected rejection in an active designed
  use case appears as a string-literal discriminant in its inbound
  `<UseCaseName>Result` type. Expected business rejections never exist only in
  an adapter.
- Domain behavior is deterministic. Time, IDs, randomness, environment,
  network, filesystem, and storage arrive as explicit values or ports.
- Application handlers coordinate one command or query. They do not contain
  core invariants or return framework, ORM, or provider objects.
- Inbound adapters validate transport input and translate results. Outbound
  adapters implement ports and isolate technology-specific errors.
- Mappers are pure boundary conversions; they do not validate business rules,
  query storage, or cause side effects.
- Composition selects concrete adapters and contains no business rules.

## Architecture decision lifecycle

Use an architecture decision record only when a change:

- moves or introduces a bounded-context boundary;
- introduces cross-context transaction coordination or shared persistence;
- creates a workspace package for a new runtime capability;
- changes synchronous versus event-driven integration; or
- adopts or replaces major infrastructure that constrains application design.

Decision records live under `docs/architecture/decisions` and follow the
lifecycle and template defined in that directory. Routine implementation
choices, naming already covered here, and temporary task notes do not require
an ADR.

## Data ownership and transactions

- Each bounded context owns its persistence records, storage namespace,
  migrations, persistence adapters, and data lifecycle.
- A context never reads or writes another context's tables through its own
  repository. Cross-context foreign keys and product-code joins across
  context-owned storage are prohibited.
- Cross-context reads use a declared public synchronous contract or a
  projection-owned read model. A projection owns its denormalized storage and
  rebuild process; it does not become the write owner of source data.
- One command and one bounded context define the transaction boundary by
  default. Distributed transactions across contexts are prohibited.
- A source context writes its persistence changes and context-local outbox
  envelope in the same transaction. Publication, leasing, retry, redelivery,
  and dead-letter handling occur after commit and do not own the source outbox
  row.
- An event consumer commits its side effect and idempotency receipt in the same
  local transaction. Idempotency keys are scoped to the owning command or
  consumer and are not a global shared store by default.
- Database clients, transaction managers, migration tools, and message
  transports are adapter concerns. They do not become catalog dependencies
  unless the dependency carries bounded-context semantics.

## Authorization boundary

- A public use case that exposes only public data declares
  `Authorization: none` and does not create a placeholder authorization port.
- A protected use case receives a verified actor reference from its delivery
  boundary and asks a context-owned authorization policy port before protected
  data access or mutation. UI state, route parameters, and mock sessions are
  not authorization authorities.
- Tenant and resource scope come from an owning context or verified policy
  provider. Caller-supplied identifiers may select a resource but never prove
  membership, ownership, or permission.
- Authorization produces a context-specific discriminated decision:
  `{ allowed: true }` or `{ allowed: false, reason: <named denial> }`. Expected
  denial is an application result, not an exception.
- Domain rules remain independent of the current actor. Inbound adapters map
  authorization results to transport behavior without inventing permission
  policy.
- Do not create a shared authorization package or activate authentication
  merely to satisfy this contract. Add the concrete actor, action, resource,
  denial type, and policy port with the first real protected use case.

## Runtime composition

- Each context keeps its composition root private under `composition/`.
  Composition creates handlers, selects concrete adapters, injects runtime
  capabilities, and returns a boundary-specific facade.
- App Router code imports only a public context entrypoint. It cannot import a
  composition root, choose a concrete adapter, or configure module internals.
- Public entrypoints normally re-export an inbound adapter. A server entrypoint
  may instead project a same-named function member from an explicitly imported
  private composition facade. It never exports the facade, calls a composition
  factory, or adds wrapper logic. Mutable `configure()/get()` registries,
  service locators, and import-time registration side effects are prohibited.
- Pure local dependencies may be composed once and reused for the process.
  Environment parsing, network clients, database connections, exporters, and
  other side-effectful resources initialize lazily at an application-owned
  runtime boundary and remain build-safe.
- Dependencies cross application and adapter boundaries as explicit
  constructor, function, or factory inputs. Domain and application code never
  read framework globals or dependency containers.

## Observability ownership

- `@support/observability` owns vendor-neutral logging, tracing, and metrics
  APIs. The consuming application owns SDK registration, exporters,
  environment configuration, and unhandled request telemetry.
- Each context owns its stable operation name, outcome, and error code.
  Telemetry is attached in inbound adapters, outbound adapters, or composition
  wrappers; domain and application code do not import telemetry SDKs.
- Operational logs and traces include service, environment, active
  `traceId`/`spanId`, bounded context, use case, outcome, and a controlled error
  code when applicable. Metrics use only low-cardinality context, use case,
  outcome, and controlled error-code attributes.
- Operational telemetry never records actor IDs, tenant IDs, usernames, email
  addresses, credentials, tokens, request or response bodies, or unreviewed
  provider payloads. These fields are redacted defensively if supplied.
- Audit events and operational telemetry are separate contracts. Actor,
  tenant, resource, and authorization evidence belong to the owning audit
  capability, not operational logs, traces, or metrics.
- `traceId` and `spanId` are the default request correlation mechanism. A
  separate external request ID is accepted only from a trusted boundary and
  must be validated before recording.

## Consistency and errors

- Expected business rejection uses a named discriminated result such as
  `{ ok: true, value } | { ok: false, error }`. Exceptions represent unexpected
  or infrastructure failure only.
- Repository absence is represented consistently by an explicit result or
  documented nullable return; do not interchange `null`, `undefined`, and
  exceptions for the same operation.
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
