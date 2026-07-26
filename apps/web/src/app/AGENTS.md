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

## Route README inheritance

- Route status and 404 behavior inherit from the nearest ancestor route
  `README.md`.
- Add a descendant README only when URL parsing, status, owning context,
  authorization, direct-navigation behavior, or an exception differs.
- An omitted descendant README means full inheritance; do not copy the parent
  summary merely to document the folder.

## Verification delta

Check direct navigation and affected route states. Route changes must keep
module imports on public entrypoints and pass the architecture checks.
