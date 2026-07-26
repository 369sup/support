# App Router Delivery Contract

Scope: `apps/web/src/app/**`. This directory is a routing manifest, not a
general source directory.

## Delivery delta

- Use only supported App Router or metadata file conventions plus local
  `AGENTS.md`/`README.md` documentation.
- Route files bind params, search params, cookies, headers, forms, and transport
  results to module public entrypoints. Business rules, persistence, provider
  calls, and reusable product UI remain in the owning context.
- Treat loading, error, not-found, unauthorized, and empty states as explicit
  delivery behavior. Do not turn a planned, deferred, unowned, or excluded
  route into an active capability.
- Perform authorization in the owning module policy. Route guards may enforce
  a decided result but do not define role or tenant semantics.
- Use caching, revalidation, pre-routing, and Server Actions only with explicit
  ownership, invalidation, and failure behavior.
- Preserve accessibility, metadata, direct navigation, refresh, and
  back/forward behavior for user-visible routes.

## Route contract loading

- `apps/web/route-map.json` owns URL, status, parameter, delivery-function, and
  module mappings. Do not edit generated route READMEs or generated TypeScript.
- Load only the README beside the target `page.tsx` or `route.ts`. A
  documented-only URL has a generated README but no delivery file.
- Keep full use-case semantics in the owning module README; the route README
  contains only delivery-facing summaries and references.

## Verification delta

Check direct navigation and affected route states. Route changes must keep
module imports on public entrypoints and pass the architecture checks.
