# Bounded-Context Implementation Contract

This file governs `apps/web/src/modules/**` and inherits the source
architecture contract. Next.js delivery belongs to `src/app`; modules own
capability behavior independently of URL structure.

## Required authorities

Before adding or moving module code, read:

- [`docs/architecture/architecture.md`](../../../../docs/architecture/architecture.md)
  for dependency direction, layers, public entrypoints, and naming;
- [`docs/architecture/module-template.md`](../../../../docs/architecture/module-template.md)
  for bounded-context shape;
- [`docs/architecture/module-map.json`](../../../../docs/architecture/module-map.json)
  for context identity, ownership, dependencies, status, and official product
  sources; and
- [`docs/architecture/exceptions/registry.json`](../../../../docs/architecture/exceptions/registry.json)
  for approved exceptions.

Do not redefine those contracts in a local instruction file. When a canonical
contract changes, update its enforcement and fixtures in the same change.

## Context structure

- Use `modules/<subdomain>/<bounded-context>/`; both names are lowercase
  kebab-case and must match the module catalog.
- A planned context is README-only. Do not add source, layers, entrypoints,
  fixtures, or a nested `AGENTS.md` until activation is approved.
- An active context contains only the canonical layers and the smallest public
  entrypoints required by real consumers.
- Add a context-level `AGENTS.md` only for durable local terminology, workflow,
  validation, or an approved exception. Do not copy inherited rules.
- Route groups, page names, UI screens, database tables, providers, and teams
  do not define bounded contexts.

## Naming

- Directories and source files use lowercase kebab-case. Classes and types use
  PascalCase; functions and variables use camelCase; booleans use predicate
  prefixes.
- Name files by their architecture role using the suffix and location defined
  in the canonical naming matrix; do not invent competing suffixes.
- Do not use bare generic names such as `utils`, `helpers`, `common`, `shared`,
  `service`, `manager`, `processor`, `types`, `models`, `interfaces`,
  `handlers`, or `constants`.
- The only context-root entrypoint names are `server-api.ts`,
  `browser-ui.ts`, `server-actions.ts`, and `integration-contracts.ts`.
  Create only an entrypoint with a real consumer.
- Follow the canonical use-case naming chain from kebab-case capability name to
  `PascalCaseUseCase`, `camelCase()` operation, and kebab-case `.handler.ts`.
- Keep one primary runtime export per ordinary module file. Use named exports;
  do not add wildcard or multi-level barrel re-exports.

## Dependency and runtime boundaries

- Domain and application layers must not import Next.js, React, an ORM,
  provider SDKs, adapters, Node-specific APIs, or environment variables.
  Required external behavior is represented by ports.
- Adapters translate boundary data; they do not become owners of business
  policy.
- App-to-module and cross-context imports use only the canonical context-root
  entrypoints. Imports inside one context use relative paths.
- A cross-context source import requires both a public entrypoint and a
  declared synchronous dependency in `module-map.json`.
- `browser-ui.ts` must remain transitively browser-safe. It cannot reach
  application handlers, composition, outbound adapters, Node APIs, secrets, or
  `process.env`.
- Public contracts remain framework-free and do not expose domain objects,
  handlers, ports, adapters, ORM records, or provider types.
- Module collaboration is an in-process call through an explicit public
  contract unless an approved event dependency is required. Do not introduce a
  network boundary to imitate service isolation inside this application.

## Domain model

The canonical domain, data, authorization, error, and reliability rules live
in [`docs/architecture/architecture.md`](../../../../docs/architecture/architecture.md).
Apply them in this subtree as follows:

- Give each business rule and data set one owning bounded context. Use its
  ubiquitous language consistently; similar words in different contexts may
  have separate models when their meanings differ.
- Domain objects are framework- and infrastructure-free and executable without
  Next.js, React, a database, network, queue, or provider SDK.
- Entities have stable identity and change state only through meaningful
  behavior that protects invariants. Do not expose mutable internal
  collections.
- Value objects are immutable, validate themselves at creation, and compare by
  value. Money carries currency and an explicit precision and rounding policy;
  measurements carry units.
- An aggregate has one root, protects all aggregate invariants, and is the
  persistence boundary. Keep aggregates small; one transaction directly
  modifies one aggregate unless an approved coordination design says
  otherwise.
- A domain service contains only a pure domain rule that cannot naturally
  belong to an entity or value object. It does not orchestrate use cases,
  access storage, or call external services.
- Current time, identifiers, randomness, storage, filesystem, and external
  communication arrive as explicit values or replaceable ports. Core behavior
  must not read system time, environment variables, or global mutable state.

## Application, ports, and adapters

- One use case represents one user or system intent with explicit input,
  output, preconditions, authorization, tenant or resource scope, and failure
  semantics. Application handlers coordinate the flow but do not own core
  invariants.
- Commands express state-changing intent. Queries do not cause business state
  changes and may use purpose-built read models without reconstructing an
  aggregate.
- The inner layer that needs a capability defines its Port in business terms.
  A Port must not expose an ORM query builder, database row, HTTP client,
  provider SDK, cache implementation, or transport detail.
- Inbound adapters translate and validate external input into a use-case
  contract. Outbound adapters implement an existing Port, map data explicitly,
  and translate technical failures without making business decisions.
- DTOs, domain objects, persistence records, provider types, domain events, and
  integration events are distinct contracts. Do not reuse one across a
  boundary merely because its fields look similar.
- Expected validation, authorization, absence, conflict, and business rejection
  have distinct typed semantics. Adapters map them consistently; unexpected
  failures are recorded and return a safe generic boundary response.

## Persistence, transactions, and events

- A Repository is named for and persists an aggregate root. Its methods express
  real domain needs and do not return ORM records or an unrestricted generic
  CRUD/query interface. Do not introduce a universal Base Repository.
- Each context owns its schema, migrations, storage namespace, retention, and
  erasure behavior. Another context uses a public query contract, use case, or
  event projection instead of reading the owner's tables.
- Application use cases control transaction boundaries. Do not hold a
  transaction across uncontrolled long-running network calls, and do not
  assume a database commit and message publish are automatically atomic.
- Write persistence changes and a local outbox record atomically when an event
  must be published. Consumers must be idempotent and commit their effect with
  their deduplication receipt.
- Domain events are past-tense business facts produced by domain behavior.
  Integration events are separately versioned public contracts with an
  explicit compatibility policy.
- Database constraints are a final defense in addition to domain invariants.
  Migrations are reproducible and append-only after deployment.
- Queries use stable sorting, bounded pagination or batching, and database-side
  filtering and aggregation. Avoid unbounded reads, N+1 queries, and
  application-memory processing of large data sets.

## Security and integration reliability

- Authentication proves identity; authorization decides one actor's ability to
  perform one operation on one resource. Every protected use case authorizes on
  the server, independent of UI visibility or route access.
- Resolve tenant and resource scope from a trusted owner. Unverified client
  input may select a candidate identifier but never proves tenant membership,
  ownership, or permission.
- Validate all external input at the inbound boundary and enforce invariants
  again in the domain. Filter output to the caller's permission and minimum
  disclosure needs.
- External calls have explicit timeout, cancellation, bounded retry, and
  degradation behavior. Retry only classified transient and idempotent
  operations; never assume at-most-once delivery.
- Background and event work is observable, retryable, concurrency-bounded, and
  independent of the originating HTTP request lifecycle.

## Implementation workflow

Before coding, confirm the approved use case, owner, invariants, inputs,
result, command/query classification, ports, authorization owner, tenant or
resource scope, sensitive-data handling, events, and failure behavior in the
context README and catalog.

Implement domain and application behavior before concrete adapters. Expose the
smallest boundary required by a real consumer and add tests at the boundary
carrying the risk. Do not derive product behavior from model memory or a
similarly named implementation.

Domain tests use no framework or infrastructure. Use-case tests control every
outbound Port with a fake. Adapter tests exercise the real technical contract,
public entrypoints receive contract tests, and critical journeys receive
proportionate end-to-end coverage.

## Validation

Run focused context tests first, then `pnpm typecheck`, `pnpm lint`,
`pnpm architecture`, and `pnpm check` when practical. Inspect the final diff
for private deep imports, client/server leaks, forbidden generic names,
uncataloged contexts, and copied exceptions.
