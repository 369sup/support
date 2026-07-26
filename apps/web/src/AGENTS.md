# Web Source Architecture Contract

Scope: `apps/web/src/**`. The canonical rules are in
[`../../../docs/architecture/architecture.md`](../../../docs/architecture/architecture.md).

## Fixed source shape

- `app/` owns App Router delivery, request binding, metadata, navigation, and
  route presentation.
- `modules/` owns product bounded contexts, use cases, policies, persistence
  ports, events, authorization, and tenant-safe behavior.
- Do not add another source root beside `app`, `modules`, and this file.

## Placement and dependencies

- Put a behavior in `modules` when it expresses product intent or rules; put it
  in `app` only when it binds a framework route to an existing capability.
- App code imports module public root entrypoints. Modules never import `app`;
  cross-context imports use declared public contracts.
- Keep server-only capabilities out of client graphs. A Client Component is an
  explicit browser boundary, not a default placement.
- Await or deliberately track every Promise and bound collection concurrency.
- Tests assert the owning boundary's observable contract; route tests do not
  replace use-case tests.

## Verification delta

After source changes, inspect IDE diagnostics and references, run the narrowest
affected test, then architecture, typecheck, and lint as required by impact.
