# `src/modules` Architecture Contract

This directory contains the business modules of a **Domain-Driven Modular Monolith** implemented with **Hexagonal Architecture (Ports and Adapters)**.

These instructions apply to every file below `src/modules/`. Treat them as architecture rules, not suggestions.

## 0. Boundary with `src/app`: divide code by ownership

Use this sentence as the primary classifier:

```text
src/app     = WHERE and HOW Next.js exposes a capability
src/modules = WHAT the business capability does
```

`src/app` owns App Router conventions, URLs, route layouts, parallel slots,
metadata, request binding, and route-level response composition. A bounded
context under `src/modules` owns its business model, use cases, ports, adapters,
feature UI, and dependency wiring.

### Mandatory ownership matrix

| Concern | Put it in |
| --- | --- |
| `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `default.tsx`, `route.ts` | `src/app` |
| `params`, `searchParams`, route metadata, route groups, `@slots` | `src/app` |
| Business invariants, policies, aggregates, value objects | Module `domain` |
| Commands, queries, handlers, DTOs | Module `application` |
| Interfaces for repositories/providers | Module `application/ports/outbound` |
| Database/SDK/provider implementations | Module `adapters/outbound` |
| Feature-specific React UI, hooks, view models | Module `adapters/inbound/next/ui` |
| Feature-specific Server Actions | Module `adapters/inbound/next/server-actions` |
| Dependency construction | Module `composition` |
| Business-free shadcn primitives | `src/components/ui` |
| Business-free technical helpers | `src/lib` |

Next.js or React dependencies are allowed only in inbound Next adapters. They
must never enter `domain`, `application`, or framework-free `contracts`.
Outbound adapters may depend on their infrastructure libraries but must not
import Next.js route files.

### Required execution flow

For a normal page query:

```text
src/app/.../page.tsx
  -> await Next.js params/searchParams
  -> call module public index.ts
  -> module composition selects adapters
  -> application query handler
  -> outbound repository port
  -> persistence adapter
  -> result DTO/view model
  -> feature UI
  -> route response
```

For a mutation:

```text
form/client interaction
  -> module public actions.ts
  -> adapters/inbound/next/server-actions/*.action.ts
  -> application command handler
  -> domain aggregate enforces invariants
  -> outbound ports
  -> result DTO
  -> Next revalidation/redirect at the inbound edge
```

No step may skip from `src/app` directly to an ORM, provider SDK, repository
adapter, or domain aggregate.

### Public entrypoint contract

Every bounded context exposes only the entrypoints it needs:

```text
<bounded-context>/
├── index.ts       # server-only facade and server-safe feature UI
├── client.ts      # optional browser-safe UI/hooks/types
├── actions.ts     # optional public Server Actions; async exports only
└── contracts.ts   # framework-free cross-context contracts
```

- Add `import "server-only"` to `index.ts` when it can reach composition,
  secrets, Node APIs, a database, or server-only adapters.
- A file with `"use client"` imports only `client.ts`, `actions.ts`, shared UI,
  and browser-safe packages. It must never import `index.ts`.
- `actions.ts` re-exports only valid Server Actions. It must not become a mixed
  server facade.
- `contracts.ts` contains no React, Next.js, ORM, provider, aggregate, or
  handler imports.
- Everything else in the bounded context is private. TypeScript path access is
  not architectural permission.

### Framework binding versus business input

Split mixed code at the boundary:

```tsx
// src/app/(console)/projects/page.tsx
import { ProjectsScreen } from "@/modules/work-management/project-management"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const { query = "" } = await searchParams
  return <ProjectsScreen query={query} />
}
```

The route knows `searchParams`; the module receives a plain `query`. The module
returns a result DTO or renders feature UI; it does not receive Next.js page
props. Apply the same split to `params`, `cookies()`, `headers()`, `NextRequest`,
`redirect()`, and `notFound()`.

### Ambiguity resolver

When uncertain, ask what would happen if this capability were exposed through
a CLI or queue consumer tomorrow:

- Code still needed by the CLI/consumer belongs in `domain` or `application`.
- Database/provider translation still belongs in outbound adapters.
- Only the URL, React layout, page props, HTTP mapping, and Next navigation stay
  in `src/app` or a module's explicit Next inbound adapter.

Do not solve ambiguity by duplicating logic in a page and a module.

## 1. Vocabulary: do not merge these concepts

### `<subdomain>` is a business problem-space classification

A subdomain describes **what part of the business problem** we are addressing. Examples:

- `identity-access`
- `work-management`
- `communication`

A subdomain is not a deployable unit, not a technical layer, and not automatically a single model.

### `<bounded-context>` is a model and ownership boundary

A bounded context defines **where one domain model and ubiquitous language are valid**. It is the unit of modularity, encapsulation, ownership, composition, testing, and possible future extraction.

Examples inside `work-management`:

- `project-management`
- `repository-catalog`

Rules:

1. The required path shape is always:

   ```text
   src/modules/<subdomain>/<bounded-context>/
   ```

2. `<subdomain>` and `<bounded-context>` are placeholders. Never create directories literally named `<subdomain>` or `<bounded-context>`.
3. One subdomain may contain one or more bounded contexts.
4. A bounded context belongs to exactly one subdomain in this repository.
5. Do not use technical names such as `api`, `database`, `utils`, `services`, or `common` as a subdomain or bounded-context name.
6. Do not collapse the two levels into `src/modules/<bounded-context>/`.
7. Use lowercase kebab-case for both levels.

## 2. Canonical structure

Use this complete tree when creating a bounded context. Omit an optional directory only when the bounded context genuinely has no such concern; do not move the concern into the wrong layer.

```text
src/
├── app/                                      # Next.js delivery/composition edge only
│   ├── (console)/
│   │   └── <route>/page.tsx                 # Thin inbound adapter entrypoint
│   └── api/
│       └── <route>/route.ts                 # Thin HTTP entrypoint
│
└── modules/
    ├── AGENTS.md
    │
    └── <subdomain>/                         # Business problem space
        ├── README.md                        # Optional subdomain map; no implementation
        │
        └── <bounded-context>/               # Model, language, and ownership boundary
            ├── README.md                    # Purpose, language, invariants, context relations
            ├── index.ts                     # Server-side public API only
            ├── client.ts                    # Optional browser-safe public API only
            ├── actions.ts                   # Optional public Server Actions only
            ├── contracts.ts                 # Cross-context contract exports only
            │
            ├── domain/                      # Pure business model; innermost layer
            │   ├── aggregates/
            │   │   └── <aggregate-name>/
            │   │       ├── <aggregate-name>.aggregate.ts
            │   │       ├── <aggregate-name>.types.ts
            │   │       └── <aggregate-name>.spec.ts
            │   ├── entities/
            │   │   ├── <entity-name>.entity.ts
            │   │   └── <entity-name>.spec.ts
            │   ├── value-objects/
            │   │   ├── <value-name>.value-object.ts
            │   │   └── <value-name>.spec.ts
            │   ├── services/                # Stateless domain services only
            │   │   ├── <domain-operation>.domain-service.ts
            │   │   └── <domain-operation>.spec.ts
            │   ├── policies/                # Domain decisions/rules spanning objects
            │   │   └── <policy-name>.policy.ts
            │   ├── events/                  # Internal domain events; never cross contexts
            │   │   └── <event-name>.domain-event.ts
            │   ├── errors/
            │   │   └── <error-name>.domain-error.ts
            │   └── types/
            │       └── branded-types.ts
            │
            ├── application/                 # Use-case orchestration
            │   ├── commands/                # State-changing vertical slices
            │   │   └── <verb-noun>/
            │   │       ├── <verb-noun>.command.ts
            │   │       ├── <verb-noun>.handler.ts
            │   │       ├── <verb-noun>.result.ts
            │   │       └── <verb-noun>.spec.ts
            │   ├── queries/                 # Read-only vertical slices
            │   │   └── <verb-noun>/
            │   │       ├── <verb-noun>.query.ts
            │   │       ├── <verb-noun>.handler.ts
            │   │       ├── <verb-noun>.result.ts
            │   │       └── <verb-noun>.spec.ts
            │   ├── ports/
            │   │   ├── inbound/             # Use cases invoked by inbound adapters
            │   │   │   └── <use-case>.use-case.ts
            │   │   └── outbound/            # Capabilities required from the outside
            │   │       ├── <aggregate>.repository.port.ts
            │   │       ├── <service>.gateway.port.ts
            │   │       ├── clock.port.ts
            │   │       ├── id-generator.port.ts
            │   │       └── unit-of-work.port.ts
            │   ├── dto/                     # Application boundary data; never domain objects
            │   │   └── <operation>.dto.ts
            │   ├── mappers/                 # Domain ↔ application DTO mapping
            │   │   └── <model>.mapper.ts
            │   └── errors/
            │       └── <error-name>.application-error.ts
            │
            ├── contracts/                   # Stable public contracts for other contexts
            │   ├── integration-events/
            │   │   └── <event-name>.integration-event.ts
            │   ├── commands/                # Only intentionally public commands
            │   │   └── <command-name>.contract.ts
            │   ├── queries/                 # Only intentionally public queries
            │   │   └── <query-name>.contract.ts
            │   └── schemas/                 # Runtime validation for boundary payloads
            │       └── <payload-name>.schema.ts
            │
            ├── adapters/                    # Framework and infrastructure details
            │   ├── inbound/                 # Driving adapters: outside calls inward
            │   │   ├── next/
            │   │   │   ├── server-actions/
            │   │   │   │   └── <action-name>.action.ts
            │   │   │   ├── route-handlers/
            │   │   │   │   └── <route-name>.handler.ts
            │   │   │   └── ui/
            │   │   │       ├── components/
            │   │   │       │   └── <component-name>.tsx
            │   │   │       ├── hooks/
            │   │   │       │   └── use-<feature>.ts
            │   │   │       └── view-models/
            │   │   │           └── <view-name>.view-model.ts
            │   │   ├── jobs/
            │   │   │   └── <job-name>.job.ts
            │   │   └── events/
            │   │       └── <event-name>.subscriber.ts
            │   │
            │   └── outbound/                # Driven adapters: application calls outward
            │       ├── persistence/
            │       │   ├── schema/
            │       │   │   └── <context-name>.schema.ts
            │       │   ├── mappers/
            │       │   │   └── <aggregate>.persistence-mapper.ts
            │       │   └── repositories/
            │       │       └── <aggregate>.repository.adapter.ts
            │       ├── messaging/
            │       │   └── <broker-name>.message-bus.adapter.ts
            │       ├── email/
            │       │   └── <provider-name>.email.adapter.ts
            │       ├── cache/
            │       │   └── <provider-name>.cache.adapter.ts
            │       ├── external-services/
            │       │   └── <service-name>.gateway.adapter.ts
            │       ├── time/
            │       │   └── system-clock.adapter.ts
            │       └── ids/
            │           └── uuid-generator.adapter.ts
            │
            ├── composition/                 # Outermost wiring; no business rules
            │   ├── create-<context>.ts       # Builds adapters and injects ports
            │   ├── register-adapters.ts
            │   └── index.ts
            │
            └── tests/
                ├── architecture/
                │   └── dependency-rules.spec.ts
                ├── contract/
                │   └── <contract-name>.contract.spec.ts
                ├── integration/
                │   ├── inbound/
                │   │   └── <adapter-name>.integration.spec.ts
                │   └── outbound/
                │       └── <adapter-name>.integration.spec.ts
                ├── e2e/
                │   └── <business-flow>.e2e.spec.ts
                ├── fixtures/
                │   └── <model-name>.fixture.ts
                └── fakes/
                    └── fake-<outbound-port>.ts
```

## 3. Concrete example

The first two directories are different concepts. `work-management` is the subdomain; `project-management` and `repository-catalog` are separate bounded contexts inside it.

```text
src/modules/
├── identity-access/                         # <subdomain>
│   ├── authentication/                      # <bounded-context>
│   │   ├── domain/
│   │   ├── application/
│   │   ├── contracts/
│   │   ├── adapters/
│   │   ├── composition/
│   │   ├── tests/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── actions.ts
│   │   └── contracts.ts
│   └── authorization/                       # another <bounded-context>
│       └── ...same complete context layers...
│
├── work-management/                         # <subdomain>
│   ├── project-management/                  # <bounded-context>
│   │   ├── domain/
│   │   │   ├── aggregates/
│   │   │   │   └── project/
│   │   │   │       ├── project.aggregate.ts
│   │   │   │       ├── project.types.ts
│   │   │   │       └── project.spec.ts
│   │   │   ├── entities/
│   │   │   │   └── project-member.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── project-id.value-object.ts
│   │   │   │   └── project-name.value-object.ts
│   │   │   ├── services/
│   │   │   ├── policies/
│   │   │   ├── events/
│   │   │   │   └── project-created.domain-event.ts
│   │   │   └── errors/
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   └── create-project/
│   │   │   │       ├── create-project.command.ts
│   │   │   │       ├── create-project.handler.ts
│   │   │   │       ├── create-project.result.ts
│   │   │   │       └── create-project.spec.ts
│   │   │   ├── queries/
│   │   │   │   └── get-project/
│   │   │   │       ├── get-project.query.ts
│   │   │   │       ├── get-project.handler.ts
│   │   │   │       ├── get-project.result.ts
│   │   │   │       └── get-project.spec.ts
│   │   │   └── ports/
│   │   │       ├── inbound/
│   │   │       │   ├── create-project.use-case.ts
│   │   │       │   └── get-project.use-case.ts
│   │   │       └── outbound/
│   │   │           ├── project.repository.port.ts
│   │   │           ├── id-generator.port.ts
│   │   │           └── clock.port.ts
│   │   ├── contracts/
│   │   │   ├── integration-events/
│   │   │   │   └── project-created.integration-event.ts
│   │   │   └── schemas/
│   │   │       └── project-summary.schema.ts
│   │   ├── adapters/
│   │   │   ├── inbound/next/
│   │   │   │   ├── server-actions/create-project.action.ts
│   │   │   │   ├── route-handlers/projects.handler.ts
│   │   │   │   └── ui/components/project-list.tsx
│   │   │   └── outbound/persistence/
│   │   │       ├── schema/project-management.schema.ts
│   │   │       ├── mappers/project.persistence-mapper.ts
│   │   │       └── repositories/project.repository.adapter.ts
│   │   ├── composition/
│   │   │   ├── create-project-management.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   ├── architecture/
│   │   │   ├── contract/
│   │   │   ├── integration/
│   │   │   ├── e2e/
│   │   │   ├── fixtures/
│   │   │   └── fakes/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── actions.ts
│   │   └── contracts.ts
│   │
│   └── repository-catalog/                  # separate <bounded-context>
│       └── ...same complete context layers...
│
└── communication/                           # <subdomain>
    └── notification-delivery/               # <bounded-context>
        └── ...same complete context layers...
```

## 4. Dependency direction

Dependencies point inward. The inner layer never imports an outer layer.

```text
Next.js / jobs / subscribers
          │
          ▼
inbound adapters ──► inbound ports ──► application handlers
                                             │
                                             ▼
                                           domain
                                             ▲
                                             │
application handlers ──► outbound ports ◄── outbound adapters
                                 ▲
                                 │
                          composition wires them
```

| From | May import | Must not import |
| --- | --- | --- |
| `domain` | Same context `domain` | `application`, `contracts`, `adapters`, `composition`, Next.js, React, ORM, HTTP clients |
| `application` | Same context `domain`, `application/ports` | Concrete adapters, Next.js, React, ORM/database clients |
| `contracts` | Boundary schemas and dependency-free contract types | Domain aggregates/entities, application handlers, adapters |
| `adapters/inbound` | Inbound ports, public application DTOs, framework libraries | Outbound adapter implementations, domain persistence details |
| `adapters/outbound` | Outbound ports, required domain/application types, infrastructure libraries | Inbound adapters, Next.js pages, other adapter implementations |
| `composition` | Application ports/handlers and concrete adapters | Business rules |
| `src/app` | A bounded context's `index.ts`, `client.ts`, `actions.ts`, or `contracts.ts` | Deep module internals |
| Another bounded context | Provider `contracts.ts` or deliberately exported `index.ts` API | Provider `domain`, `application`, `adapters`, database schema |

### Absolute rules

- Domain code must be deterministic and framework-free.
- Domain code must not know that Next.js, React, a database, an email provider, or an HTTP API exists.
- Application handlers orchestrate a single use case. Business invariants belong in the domain.
- Inbound ports describe what the application offers.
- Outbound ports describe what the application needs.
- Adapters translate between a technology and a port. They do not own business decisions.
- Composition is the only place that selects concrete adapter implementations.
- Never inject a concrete adapter where a port type is expected.
- Never call one application handler from another. Extract shared domain behavior or orchestrate at a higher boundary.
- Never import adapter A from adapter B.

## 5. Public boundaries and cross-context communication

Treat every bounded context as a private mini-application.

### Public files

- `index.ts`: server-side API intentionally exposed to `src/app` and other contexts.
- `client.ts`: optional browser-safe exports. It must not transitively import secrets, database code, Node-only APIs, or server composition.
- `actions.ts`: optional public Server Actions. It contains or re-exports async Server Actions only and must preserve the `"use server"` boundary.
- `contracts.ts`: stable commands, queries, integration events, and schemas intended for cross-context use.

All other files are private even though TypeScript can technically import them.

### Cross-context rules

1. Never share aggregates, entities, or value objects across bounded contexts.
2. Pass identifiers, primitives, or explicit contracts and map them into the consuming context's model.
3. A synchronous dependency uses a consumer-owned outbound port plus an adapter that calls the provider's public API.
4. An asynchronous dependency uses an integration event from the provider's `contracts/` boundary.
5. Domain events stay inside their bounded context. Translate them to integration events in the application layer.
6. Never read or write another context's tables or repository directly.
7. Keep transactions inside one bounded context and one use case by default. Cross-context consistency is explicit and usually eventual.
8. Record new relationships in each bounded context's `README.md` as upstream/downstream, customer/supplier, conformist, anticorruption layer, or published language.

## 6. Next.js boundary

`src/app` is an inbound delivery edge, not the business layer.

- `page.tsx`, `route.ts`, and Server Actions should parse framework input, call a module public API, and translate the result to UI/HTTP output.
- Do not place business invariants, persistence queries, or provider SDK calls in `src/app`.
- Next.js route groups such as `(console)` and `(public)` organize URLs/layouts; they are not DDD bounded contexts.
- A URL segment is not automatically a bounded context.
- Files under `src/modules` do not become routes. Only Next.js `page.tsx` or `route.ts` files under `src/app` expose routes.
- Keep Client Components at the edge. Import browser-safe code only from a context's `client.ts`.
- Server-only composition must remain behind `index.ts` and must not leak into a client bundle.

Preferred entrypoint shape:

```text
src/app/(console)/projects/page.tsx
    └── imports from
        src/modules/work-management/project-management/index.ts
            └── composition injects outbound adapters into application ports
```

## 7. Ports and adapter placement

Default port location is `application/ports` because application handlers usually consume the capability.

Place a port in `domain/ports` only in the exceptional case where the domain model itself must express the capability as part of a domain rule. Document the reason in the bounded context `README.md`. Do not duplicate the same port in both layers.

Naming:

- Inbound: `<use-case>.use-case.ts`
- Repository port: `<aggregate>.repository.port.ts`
- External capability: `<service>.gateway.port.ts`
- Outbound implementation: `<technology-or-provider>.<capability>.adapter.ts`
- Persistence implementation: `<aggregate>.repository.adapter.ts`

The port is named after a business-required capability, not after a vendor. Prefer `email-sender.port.ts` over `resend.port.ts` and `project.repository.port.ts` over `postgres-projects.port.ts`.

## 8. Domain modeling rules

- Aggregate roots protect invariants and are the only mutation entrypoint for their aggregate.
- Entities have stable identity.
- Value objects are immutable and validate themselves at creation.
- Domain services are stateless operations that do not naturally belong to one entity or value object.
- Domain policies express business decisions; they are not authorization middleware or framework policies.
- Domain errors use business language.
- Do not create an anemic `domain/models` directory containing database-shaped interfaces.
- Do not mirror database tables one-to-one unless that is genuinely the domain model.
- Repository ports are defined per aggregate, not per table.

## 9. Application rules

- Organize commands and queries by use case (vertical slices), not one global `handlers/` directory.
- Commands may mutate state; queries must not mutate state.
- Input and output at this layer are application DTOs/results, not framework request/response objects.
- Handlers coordinate domain objects and ports but contain no core business rules.
- Keep one transaction boundary per command handler unless explicitly documented.
- Do not return ORM records from a handler.

## 10. Adapter rules

- Inbound adapters validate and translate external input before invoking an inbound port.
- Outbound adapters implement exactly one or a small cohesive set of outbound ports.
- Persistence mappers translate between domain objects and persistence records.
- ORM schemas and migrations belong to the bounded context that owns the data.
- Provider-specific errors are translated into application/domain-safe errors at the adapter boundary.
- Retry, timeout, idempotency, and observability behavior belongs at an adapter or composition boundary unless it is a business rule.

## 11. Testing strategy

- Domain unit tests: no mocks for domain behavior and no infrastructure.
- Application tests: use fakes for outbound ports and verify orchestration.
- Contract tests: verify published contracts and adapter conformance.
- Adapter integration tests: use the real boundary technology where practical.
- Architecture tests: fail on forbidden imports and cross-context deep imports.
- E2E tests: enter through the real Next.js/HTTP/job boundary and verify a business flow.
- Keep fixtures/builders inside the owning bounded context's `tests/` directory.

## 12. Shared code policy

Do not create `src/modules/common`, `src/modules/shared`, or a generic shared domain dumping ground.

- Generic technical helpers with no business meaning belong in `src/lib`.
- Business concepts remain in the bounded context that owns their language.
- A shared kernel is allowed only after explicit architectural agreement. It must be tiny, dependency-free, jointly owned, and versioned by coordinated change.
- Duplication across contexts is preferable to accidental semantic coupling when similarly named concepts have different meanings.

## 13. Codex workflow for every change

Before writing code below `src/modules`:

1. Name the business subdomain.
2. Name the bounded context and confirm its ubiquitous language.
3. State the use case, aggregate, invariants, inputs, and outputs.
4. Decide whether the entry is a command or query.
5. Define the inbound port and required outbound ports before concrete adapters.
6. Implement or update domain behavior without framework dependencies.
7. Implement the application handler.
8. Implement adapters and wire them only in `composition/`.
9. Export the smallest possible API from `index.ts`, `client.ts`, `actions.ts`, or `contracts.ts`.
10. Keep `src/app` entrypoints thin.
11. Add tests at the appropriate levels.
12. Check for forbidden imports, cyclic dependencies, leaked ORM types, and cross-context table access.

When placement is ambiguous, stop and answer these questions before creating a file:

- Is this a business rule? Put it in `domain`.
- Is this use-case orchestration? Put it in `application`.
- Is this a contract with the outside world or another context? Put it in `contracts` or a port.
- Is this framework/provider translation? Put it in `adapters`.
- Is this dependency construction? Put it in `composition`.
- Is this URL/layout delivery? Put the thin entrypoint in `src/app`.

## 14. Definition of done

A module change is not complete unless:

- It is located under both a real `<subdomain>` and a real `<bounded-context>`.
- Dependency direction is inward and all external capabilities are behind ports.
- The domain imports no framework or infrastructure package.
- Cross-context access uses only public contracts/APIs.
- Client-safe exports cannot reach server-only code.
- The bounded context owns its persistence and integration contracts.
- Unit/integration/contract tests match the change's risk.
- `npm run lint` and `npm run build` pass.

## 15. Context7 basis

This contract was checked through Context7 against:

- `/sairyss/domain-driven-hexagon`: modules as independent boxes, vertical slicing by use case, private internals, application orchestration through ports, and domain isolation from API/database/framework dependencies.
- `/alicanakkus/modular-architecture-hexagonal-demo-project`: inbound adapters call use cases; ports define infrastructure contracts; outbound adapters implement persistence, cache, messaging, and external-service capabilities.
- `/vercel/next.js/v16.2.9`: `src` project organization, route groups that do not affect URLs, safe colocation, and the rule that a route is public only when a `page` or `route` file exists under `app`.

Primary source URLs returned by Context7:

- https://github.com/sairyss/domain-driven-hexagon/blob/master/README.md
- https://github.com/alicanakkus/modular-architecture-hexagonal-demo-project/blob/main/_autodocs/README.md
- https://github.com/vercel/next.js/blob/v16.2.9/docs/01-app/01-getting-started/02-project-structure.mdx
- https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/03-file-conventions/route-groups.mdx
