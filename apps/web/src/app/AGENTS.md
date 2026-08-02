# App Router Delivery Contract

Scope: `apps/web/src/app/**`. This directory is a routing manifest, not a
general source directory.

## Delivery delta

- Use only supported App Router or metadata file conventions plus local
  `AGENTS.md`/`README.md` documentation.
- Next.js requires default component/function exports from its documented
  `page`, `layout`, `template`, `default`, loading/error, not-found, and metadata
  convention files. This exception is limited to those framework entrypoints;
  it does not publish a renameable application API. Named-only exports are not
  discovered by the router. Keep the shared ESLint filename allowlist narrow and
  verify it with route-contract tests and the production build.
- Route files bind params, search params, cookies, headers, forms, and transport
  results to module public entrypoints. Business rules, persistence, provider
  calls, and reusable product UI remain in the owning context.
- For a mutation, apply the canonical
  [workflow-ownership rule](../../../../docs/architecture/architecture.md#context-admission-and-workflow-ownership):
  bind one owning application operation and leave cross-context coordination in
  its named application process.
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
