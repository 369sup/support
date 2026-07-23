# Deployable Applications Contract

This file governs `apps/**` and inherits the repository-root instructions.
Each descendant `AGENTS.md` adds only rules unique to its directory; it must not
copy or silently contradict an inherited rule.

## Application boundary

- Each direct child of `apps/` is one independently runnable or deployable
  application with its own package manifest, runtime entrypoints,
  configuration, and application-level tests.
- Add an application only for a distinct deployable runtime or delivery
  contract. A feature, bounded context, route, team, or preferred folder
  structure is not an application boundary.
- Split a capability into another deployable service only for a verified
  deployment, scaling, isolation, or organizational need after its domain,
  data, and transaction boundaries are stable. Do not simulate microservices
  through network calls inside the modular monolith.
- Application code may compose product contexts and business-free workspace
  packages. A workspace package must never import from `apps/**`.
- Keep code owned by one application inside that application. Move code to
  `packages/**` only when it is reusable and contains no product, tenant,
  authorization, or application-composition policy.

## Naming and structure

- Name direct application directories in lowercase kebab-case after the
  deployable runtime, not an organization or temporary initiative.
- Keep framework-reserved filenames exact. Name all other directories and
  files according to the repository architecture naming contract.
- Do not create catch-all roots such as `shared`, `common`, `utils`, or
  `services` to bypass an ownership decision.

Code placement, dependency direction, and naming remain authoritative in
[`docs/architecture/AGENTS.md`](../docs/architecture/AGENTS.md). Package rules
remain authoritative in [`packages/AGENTS.md`](../packages/AGENTS.md).

## Runtime composition and state

- Keep application composition at runtime boundaries. Inject dependencies
  through constructors, function parameters, or explicit factories; product
  code must not use a hidden service locator or import-time registration.
- Request, actor, tenant, transaction, and authorization state must not live in
  module-level mutable variables. A singleton is allowed only for a stateless
  or explicitly lifecycle-managed technical resource.
- Long-running work leaves the interactive request path. Background work must
  be retryable, observable, idempotent where redelivery is possible, and able
  to complete without the originating HTTP request.
- Application configuration has one validated owner. Do not encode environment
  differences by copying or branching business behavior, and do not let
  deployment configuration invent product policy.

## Change workflow

Before adding or moving an application, identify its runtime, deployment unit,
manifest, owner, entrypoints, and dependency direction. Prefer extending an
existing application when those properties do not change.

Run focused validation with `pnpm --filter <app-package> <script>`, then run the
repository gate justified by the affected scope.
