# Architecture Contract

This file is the canonical human-readable architecture contract. The complete
machine-readable rule registry, enforcement owner, and gate live in
`@support/tooling/architecture/policy`; every emitted rule ID must be registered
there. `AGENTS.md` files may translate these rules into concise subtree-local
workflow and review checklists, but this contract resolves semantic conflicts
and nested instructions must not weaken or broaden it.

Code-level TypeScript style is enforced by the repository ESLint and TypeScript
configuration. This document records only rules that protect architecture,
runtime boundaries, data ownership, authorization, or operational safety.

## Rule governance

- This document is the canonical semantic authority for technical development
  invariants. `CONTRIBUTING.md` owns the change and review lifecycle. Nested
  `AGENTS.md` files may restate the minimum local obligation needed at the
  point of work when they link back here and preserve the same meaning.
- `@support/tooling/architecture/policy` is the machine-readable `ARCH-*`
  registry. ESLint, TypeScript, architecture checks, tests, and CI own
  mechanical enforcement; prose is not a substitute for a reliable check.
- A new or changed enforceable rule updates its canonical text, enforcement,
  positive fixture, and negative fixture in the same change.
- Architecture exceptions use only `exceptions/registry.json` and follow the
  field contract in [`exceptions/README.md`](exceptions/README.md). Permanent,
  unused, expired, or out-of-scope exceptions fail architecture validation.
- Lint and test commands use zero-warning gates. New warning baselines, blanket
  suppressions, and permanent ignore lists are prohibited.
- Framework, language, and tool behavior is evaluated against the versions
  pinned by manifests and `pnpm-lock.yaml`. Before an upgrade, review the
  matching official migration guide, deprecations, and breaking changes; do not
  apply guidance for a different version to the current source.

## Source roots

- **ARCH-SRC-001:** `apps/web/src` contains directories `app` and `modules`
  only, plus the source-root `AGENTS.md` instruction file.
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
- **ARCH-PKG-009:** Form management, application state management, date
  handling, and UI component systems are exclusive dependency capabilities.
  The workspace keeps one primary provider for each capability and must not
  introduce a recognized overlapping provider during a migration.
- **ARCH-PKG-010:** The workspace pins an exact pnpm version, commits its
  lockfile, explicitly approves dependency build scripts with `allowBuilds`,
  and installs with `--frozen-lockfile` in CI.

| Exclusive capability | Current project selection |
| --- | --- |
| Form management | React and platform form primitives; no external form manager |
| Application state | React and Next.js primitives; no external state manager |
| Date handling | Platform `Date` and `Intl`; no external date library |
| UI component system | `@support/shadcn` |

Implementation dependencies of the selected UI package, icon libraries, and
schema validation are not competing capability providers. Adopting or replacing
one of these primary providers requires an ADR, an explicit migration scope,
and removal of the displaced provider before the migration exception expires.
- **ARCH-GRAPH-001:** Source dependencies must be acyclic.
- **ARCH-CLIENT-001:** A client entrypoint must not transitively reach
  application, composition, outbound adapters, Node APIs, secrets, or
  `process.env`.
- **ARCH-SERVER-001:** A module that directly reads `process.env` or imports a
  Node.js API imports `server-only`. Database, filesystem, secret, and internal
  service adapters follow the same marker rule even when the browser graph
  checker cannot infer the capability from an import name.
- **ARCH-API-005:** Public entrypoints expose only boundary-specific facades,
  UI, actions, or integration contracts. They never expose aggregates,
  entities, handlers, ports, outbound adapters, ORM records, provider types,
  or composition roots.

## Names and public interfaces

- Directories and source filenames use lowercase kebab-case.
- Classes, types, and React components use PascalCase; functions and variables
  use camelCase. Persistence table names use lowercase snake_case.
- Boolean names start with a predicate such as `is`, `has`, `can`, `should`,
  `was`, or `did`.
- Named event handlers use `handleXxx`; callback props that report an event use
  `onXxx`.
- Names communicate the business concept in full. Single-letter identifiers,
  unexplained abbreviations, and vague names are prohibited, including loop
  indices and generic type parameters.
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
- App Router pages, layouts, and route handlers are delivery code. They may
  compose a page, parse and validate route or search parameters, establish the
  authorization entrypoint, and initiate data loading through a public module
  API. They do not implement domain decisions, construct persistence queries,
  instantiate third-party SDK clients, or duplicate application use cases.
- Business rules remain independent of React components, HTTP request/response
  types, database clients and records, and third-party SDK types. Inbound and
  outbound adapters own translation at those boundaries.
- A function has one responsibility that can be described without joining
  independent behaviors with “and”. Split orchestration from rules, and
  extract complex conditions into named predicates or policies.
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
- Comments explain a reason, constraint, invariant, or tradeoff that the code
  cannot express. Comments that merely restate the next statement are
  prohibited.

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
an ADR. An accepted decision records the problem, selected approach, rejected
alternatives, constraints, tradeoffs, consequences, and any migration or
rollback requirement; it does not describe only the final structure.

## Dependency and supply-chain governance

- Every dependency has a current runtime or build-time consumer. A possible
  future use does not justify installation.
- Runtime, development, peer, and optional dependencies reflect how the package
  is loaded and distributed. The importing workspace declares the dependency.
- Manifest and lockfile changes are one atomic change. Review the lockfile for
  unexpected direct or transitive additions before merge.
- A package with install, postinstall, or native build scripts requires an
  explicit `allowBuilds` decision after its necessity and executed content are
  reviewed.
- Officially deprecated APIs are not introduced. Existing deprecated use is
  either removed with the version upgrade or has an owned, dated removal plan.
- Framework, React, TypeScript, shadcn, test-runner, and build-tool major
  upgrades are isolated from feature behavior and follow the version-review
  rule under [Rule governance](#rule-governance).

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

## Input trust and validation

- Every value originating outside its owning boundary is untrusted, including
  route and search parameters, headers, cookies, form data, JSON bodies,
  environment variables, stored provider payloads, webhooks, and SDK results.
- The inbound boundary parses, normalizes, validates, and bounds external input
  before calling an application use case. Validation failures are explicit
  transport results and never silently coerced into domain values.
- Browser and Client Component validation improves interaction only. Every form
  submission is validated again on the server in its Server Action, route
  handler, or server-side inbound adapter before authorization or mutation.
- A Route Handler accepts only its exported HTTP methods and validates content
  type, path parameters, query parameters, body size, and body structure before
  use. Unsupported media, oversized bodies, and malformed input receive
  bounded client errors without parsing or logging the full payload.
- Validation schemas and transport DTOs remain boundary types. They do not
  replace domain invariants or leak provider and framework types inward.
- File uploads limit count and size, validate content independently of the
  filename and browser-provided MIME type, and store only reviewed metadata.
- Login, recovery, invitation, search, public API, upload, and other expensive
  or abuse-sensitive boundaries define risk-appropriate rate limits.

## Authorization boundary

- Authentication establishes identity; authorization decides whether that
  identity may perform one operation on one resource. Missing or unverifiable
  allow conditions deny by default.
- A public use case that exposes only public data declares
  `Authorization: none` and does not create a placeholder authorization port.
- A protected use case receives a verified actor reference from its delivery
  boundary and asks a context-owned authorization policy port before protected
  data access or mutation. UI state, route parameters, and mock sessions are
  not authorization authorities.
- Tenant and resource scope come from an owning context or verified policy
  provider. Caller-supplied identifiers may select a resource but never prove
  membership, ownership, or permission.
- Tenant-owned reads and writes include the verified tenant scope in the
  storage operation. They do not query by a global identifier first and defer
  tenant isolation to an application-layer check.
- Authorization produces a context-specific discriminated decision:
  `{ isAllowed: true }` or
  `{ isAllowed: false, reason: <named denial> }`. Expected denial is an
  application result, not an exception.
- Domain rules remain independent of the current actor. Inbound adapters map
  authorization results to transport behavior without inventing permission
  policy.
- Do not create a shared authorization package or activate authentication
  merely to satisfy this contract. Add the concrete actor, action, resource,
  denial type, and policy port with the first real protected use case.
- Every Server Action and Route Handler is a public boundary. It repeats current
  authentication, resource authorization, tenant isolation, and input
  validation; caller origin, hidden fields, prior page state, and UI visibility
  are never authorization evidence.

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

## Next.js App Router delivery

- Pages and layouts remain Server Components by default. Add `"use client"`
  only for browser APIs, interactive events, client state, or lifecycle
  synchronization, and place it at the smallest stable interactive boundary.
  Pages and layouts cannot declare `"use client"`; extract the interaction into
  a child component. ESLint enforces this route-shell boundary.
- Props crossing from a Server Component to a Client Component are explicitly
  serializable DTOs. Functions, class instances, database records, provider
  objects, and values with hidden executable state do not cross that boundary.
- Route files keep the delivery responsibility defined under
  [Responsibilities and boundaries](#responsibilities-and-boundaries). Data is
  loaded by the closest responsible Server Component or application boundary;
  there is no ownerless global loading layer.
- Every data read makes an explicit cache decision: cacheability, security
  scope, key inputs, freshness, and invalidation condition. Sensitive or
  user-specific data never relies on implicit shared caching.
- Cache keys include every identity, tenant, authorization, locale, and query
  dimension that can change the result. A successful write updates or
  invalidates affected entries before reporting completion.
- Start independent server requests before awaiting them and combine them with
  parallel coordination. Sequential awaits are reserved for true data
  dependencies.
- An asynchronous region that would otherwise delay unrelated content has one
  meaningful streaming boundary. Use segment `loading.tsx` for one route-level
  state and a closer `<Suspense>` for independently completable content. A
  fallback represents the pending region without adding avoidable flicker.
- Recoverable failures are handled by the nearest route or component error
  boundary. `global-error.tsx` handles only failures that cannot recover
  locally.
- Route metadata is generated on the server. External titles, descriptions,
  URLs, and image metadata are normalized, bounded, and safely encoded before
  publication.
- Input-derived redirects, callback URLs, and return URLs use an allowlist or a
  strict same-origin check. `redirect()` never receives an unchecked absolute
  URL.
- Middleware performs only lightweight work that must precede routing. It does
  not execute full use cases, aggregate data, or make long-running external
  calls.
- Edge runtime is selected only after every direct and transitive dependency is
  verified compatible. Code that needs Node.js APIs declares the Node runtime.
- Each user flow deliberately handles loading, empty, error, not-found,
  unauthenticated, unauthorized, and success states. States that are impossible
  for a specific flow are documented by its contract rather than omitted by
  accident.

## React component contract

- A component owns one primary presentation or interaction responsibility.
  Data acquisition, business decisions, and reusable visual primitives remain
  in their owning boundaries.
- Values derivable from props, query results, or existing state are calculated
  during render and are not copied into state.
- `useEffect` synchronizes React with an external system only. Data
  transformation, event response, and render-time calculation do not use an
  Effect.
- State stays with the lowest common owner that coordinates its consumers.
  Future reuse is not a reason to create global state.
- Stateful component definitions are static module-level symbols, not nested
  inside another component's render function.
- List keys use stable domain identifiers. An array index is prohibited when
  items can be reordered, inserted, or removed.
- Primary submission uses a semantic `<form>` and an explicit submit path, not
  a generic click handler. An input remains controlled or uncontrolled for its
  full lifetime.
- Props expose only real variation points. Unused options, arbitrary
  passthrough contracts, and speculative abstractions are prohibited.
- Mutually exclusive boolean props are replaced by a named variant,
  discriminated union, or explicit component composition.
- Product behavior and tests use accessible roles, labels, and observable
  outcomes. They do not depend on fragile DOM depth, CSS class order, or
  implementation-only nodes.

The imported React lint preset is part of the zero-warning gate. It enforces
Hooks correctness, render purity, immutable state and props, static component
identity, effect safety, and related React compiler diagnostics.

## shadcn and design-system contract

- `packages/shadcn/src/ui` contains product-neutral primitives.
  Product terminology, authorization, data access, and business workflows stay
  in their bounded context.
- When an official shadcn primitive exists, add it through the version-locked
  CLI rather than creating a visually similar incomplete substitute. Review
  the resulting dependencies, overwritten files, CSS tokens, imports, and
  accessibility behavior before accepting the diff.
- A community or GitHub registry item is untrusted supply-chain input. Inspect
  its source, resolved files, dependencies, registry dependencies, environment
  variables, and install behavior with `view`, `--dry-run`, or `--diff` before
  writing files. Shared items pin a tag or full commit SHA; mutable default
  branches are prohibited.
- Color, typography, spacing, radius, shadow, stacking, and motion use the
  design-token authority. Product code does not embed brand color values or
  scatter arbitrary visual magic values.
- Token changes are verified in light, dark, and high-contrast conditions.
  Visual variants are centralized in the primitive's explicit variant API.
- A supported `className` extension cannot override accessibility, critical
  interaction state, required sizing, or semantic tokens.
- Prefer native semantic HTML. Simulated roles are used only when a native
  element cannot provide the required behavior.
- Every interactive control is keyboard operable, exposes visible focus, has a
  logical tab order, and restores focus appropriately. Icon-only controls,
  inputs, dialogs, menus, and custom controls have programmatic names.
- Error, success, selection, disabled, and warning states do not rely on color
  alone. Dialog, Sheet, Popover, and Menu behavior verifies initial focus,
  focus containment, Escape handling, and focus restoration.
- Skeletons and pending states reserve a stable approximation of final layout.
  Nonessential motion honors `prefers-reduced-motion` and is never the only
  status signal.

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
- Correlation context propagates through requests, jobs, events, and external
  calls without using personal data as an identifier.
- Every actionable alert links to an owned runbook with diagnostic steps,
  remediation, and escalation conditions. A metric without a defined response
  belongs in a dashboard rather than an alert.

## Security and data protection

- Queries, DTOs, logs, and browser payloads contain only fields required for
  the current purpose. Convenience is not a reason to fetch or expose personal
  or sensitive fields.
- Private environment variables, credentials, internal URLs, and provider
  secrets remain in server-only modules. They never enter a Client Component,
  browser bundle, rendered HTML, source map, or public asset.
- Output is encoded for its concrete destination. HTML, URL, CSV, Markdown,
  log, and command contexts do not share one generic sanitization function.
- Payments, invitations, notifications, webhooks, event consumers, and other
  retryable side effects define an idempotency scope and key before execution.
- Authentication, authorization, tenant isolation, input validation, and
  secret-access failures produce controlled, correlatable security outcomes.
  They are not swallowed by a generic fallback and do not disclose protected
  input.

## Consistency and errors

- Expected business rejection uses a named discriminated result such as
  `{ isSuccessful: true, value } | { isSuccessful: false, error }`.
  Exceptions represent unexpected or infrastructure failure only.
- Repository absence is represented consistently by an explicit result or
  documented nullable return; do not interchange `null`, `undefined`, and
  exceptions for the same operation.
- Catalog dependencies describe product or bounded-context semantics. Database,
  message transport, framework wiring, and other adapter-only relationships do
  not become synchronous catalog dependencies.
- Each boundary owns its mapping. Domain objects, ORM records, transport DTOs,
  and provider responses are distinct types.
- Route Handlers, Server Actions, and error pages return stable public error
  codes and safe messages. Stack traces, SQL, internal identifiers, environment
  details, credentials, tokens, and raw provider failures remain server-side.
- A new pattern must first be added to the canonical template and mechanical
  rules. Do not infer a standard from a single legacy file or exception.

## TypeScript contract

- Product source never uses explicit `any`. Untrusted or not-yet-proven values
  begin as `unknown` and pass runtime validation or type narrowing before use.
- Type assertions, double assertions, and non-null assertions are prohibited.
  An unavoidable third-party boundary workaround requires a local runtime
  check, a registered expiring exception, and a traceable reason; it cannot
  spread beyond that adapter. Literal `as const` declarations are allowed.
- `@ts-ignore` and `@ts-nocheck` are prohibited. `@ts-expect-error` requires a
  meaningful reason and remains only where the test or compatibility contract
  deliberately proves that the line must fail.
- External values follow [Input trust and validation](#input-trust-and-validation);
  a TypeScript annotation alone is not evidence.
- Public module entrypoints, Route Handlers, Server Actions, integration
  contracts, and use-case ports declare explicit return types. Private local
  functions may use inference when the owner remains clear.
- Finite domain state, results, and expected errors use literal unions or
  discriminated unions. Mutually contradictory boolean sets and arbitrary
  status strings are prohibited.
- Discriminated unions are handled exhaustively. Adding a member cannot fall
  silently into an unexamined `default`.
- Field absence and a present `undefined` value have different contracts.
  Indexed array and dictionary access is treated as possibly missing.
- Parameters, collections, configuration, and transport values that are not
  intentionally mutable use `readonly` contracts.
- `{}`, `object`, `Function`, `Record<string, any>`, and unrestricted index
  signatures do not replace a concrete object or callable contract.
- Private types stay beside their sole owner. Only boundary types with multiple
  consumers are exported through a public entrypoint.
- One schema or owner defines each data shape. Infer DTO and component-facing
  types from that source instead of independently repeating schema, interface,
  and props declarations.
- New finite constant sets use literal unions or `as const` objects. Runtime
  `enum` requires a specific documented need and is otherwise prohibited.
- Expected business failures use typed result variants, not parsed error
  messages. Every Promise is awaited, returned, composed, or explicitly marked
  as intentionally ignored.
- The shared compiler baseline keeps `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`, and `useUnknownInCatchVariables` enabled.

## Performance and reliability

- Performance work begins with a reproducible measurement that identifies a
  bottleneck. Record the scenario, baseline, measurement method, and expected
  threshold before changing behavior.
- Prefer the smallest change that improves the measured constraint. Report the
  after measurement and any correctness, memory, readability, or operational
  tradeoff; do not merge intuition-only optimization.
- Client bundles have an explicit per-change budget. Before adding a client
  dependency, record its measured bundle effect; work that can remain on the
  server does not move into the browser.
- Large client modules used by only part of a flow load on demand and do not
  enter every route's initial bundle.
- Images declare dimensions or a stable aspect ratio, use an appropriate
  format, and select loading priority from measured user impact.
- Lists, search, exports, and queries define maximum rows, pages, time range,
  and payload size. Unbounded work is prohibited.
- External network calls define a timeout and cancellation path. Retries apply
  only to classified transient failures, use bounded attempts and backoff, and
  never retry validation, authorization, or deterministic business rejection.
- A noncritical dependency has an explicit acceptable degradation behavior.
  Failure of a secondary integration does not indefinitely block the primary
  flow.
- Subscriptions, timers, streams, connections, and `AbortController` instances
  are released when their owning lifecycle ends.

## Tests

- Domain unit tests have no framework or infrastructure.
- Application tests use fakes for outbound ports.
- Adapters have integration or contract tests appropriate to their boundary.
- New or changed behavior updates its tests in the same change. External-input
  boundaries include invalid, missing, oversized, and unauthorized cases that
  are relevant to the contract.
- Architecture rules have positive and negative fixtures.
- Committed tests do not use `.only`, `.skip`, `.fixme`, or `.todo`. Unit and integration
  tests inject or fake time, randomness, timers, and network access instead of
  reading real sources directly.
- Browser tests wait for an observable UI, network, or application condition;
  fixed `waitForTimeout()` delays are prohibited.
- A change is complete only after the relevant tests and `pnpm check` pass.
