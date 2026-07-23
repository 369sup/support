# App Router Delivery Workflow

This file governs `apps/web/src/app/**` and owns App Router-specific workflow.
It does not redefine repository architecture.

## Required authorities

Before changing code placement, imports, or boundaries, follow:

- [`docs/architecture/architecture.md`](../../../../docs/architecture/architecture.md),
  especially `ARCH-SRC-001`, `ARCH-DEP-001`, `ARCH-DEP-007`,
  `ARCH-DEP-008`, `ARCH-CLIENT-001`, module public entrypoints, and package
  imports; and
- [`src/modules/AGENTS.md`](../modules/AGENTS.md) when a route consumes a
  bounded context.

## Route semantics

This file is authoritative for these App Router conventions:

- `(group)` organizes routes without adding a URL segment.
- `@slot` is a layout prop; `children` is the implicit slot.
- `_private` folders are excluded from routing.
- A folder is public only through `page.tsx` or `route.ts`.
- Intercepting matchers count route segments while ignoring groups and slots:
  `(.)` same level, `(..)` one level up, and `(...)` app root.
- An intercepted modal requires a canonical non-intercepted route.
- Every parallel slot needs an intentional hard-navigation fallback, normally
  `default.tsx`.
- Route groups must not resolve to duplicate URLs and do not represent DDD
  subdomains or bounded contexts.

Route-private shell composition may use underscore-prefixed folders. Product
behavior and product-aware UI remain in the owning bounded context.

## Change workflow

Before editing a route:

1. Resolve its filesystem path to the public URL.
2. Identify the owning bounded context and canonical public entrypoint.
3. For a slot, list layout props and hard-navigation fallbacks.
4. For interception, confirm the canonical route and matcher depth.
5. For a Client Component, inspect the full browser-reachable import chain.

After editing, test direct navigation, client navigation, refresh, Back,
Forward, loading, error, empty, not-found, and unauthorized states relevant to
the change. Run `pnpm typecheck`, `pnpm lint`, `pnpm architecture`, and
`pnpm check` when practical.

## Official framework basis

- <https://nextjs.org/docs/app/getting-started/project-structure>
- <https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes>
- <https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes>
- <https://nextjs.org/docs/app/api-reference/file-conventions/route-groups>
