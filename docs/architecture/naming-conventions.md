# Naming Conventions

## General names

- Directories and source filenames use lowercase kebab-case.
- Classes and types use PascalCase; functions and variables use camelCase.
- Boolean names start with a predicate such as `is`, `has`, `can`, `should`,
  `was`, or `did`.
- A filename communicates its role. Bare names such as `utils`, `helpers`,
  `common`, `shared`, `service`, `manager`, `processor`, `types`, `models`,
  `interfaces`, `handlers`, and `constants` are prohibited.
- A role-specific name such as `create-repository.handler.ts` is permitted only
  in the path assigned to that role.

## Role suffixes

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

## Semantic use-case traceability

Every application capability follows one exact naming chain:

```text
<subdomain>/<bounded-context>
  -> activationScope: <use-case-name>
  -> <UseCaseName>UseCase
  -> <useCaseName>()
  -> <use-case-name>.handler.ts
```

The handler implements the inbound use-case port and uses the camelCase
operation derived from the kebab-case activation scope. Do not expose generic
application methods such as `execute()`, `handle()`, `process()`, or `run()`.
Those names hide which business capability is being invoked when many handlers
are composed or traced.

Module API barrels named `index.ts`, `client.ts`, `actions.ts`, `public.ts`, or
`action.ts` are prohibited. The only root entrypoints are `server-api.ts`,
`browser-ui.ts`, `server-actions.ts`, and `integration-contracts.ts`. Create
only those with a real consumer. `*.action.ts` is prohibited; a Next.js Server
Action uses `*.server-action.ts`.

## Import paths

- App-to-module and cross-context imports use the canonical `@/modules/...`
  public entrypoint path.
- Imports within one context use relative paths.
- Never use multiple aliases or both an alias and a deep relative path for the
  same definition.
- Keep exported names unchanged across imports and re-exports.
- UI consumers use explicit `@support/shadcn/ui/<component>` or
  `@support/shadcn/custom/<component>` package exports; direct package source
  paths and a root UI barrel are prohibited.
