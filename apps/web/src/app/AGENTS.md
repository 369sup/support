# App Router Delivery Contract

This file governs `apps/web/src/app/**` and inherits the source architecture
contract. It narrows the framework's optional colocation model: this repository
uses `app` as a routing manifest, not as a general source directory.

## Allowed contents

- Documentation files named `AGENTS.md` or `README.md` are allowed because they
  do not participate in runtime routing. Every other file under `app/` must be
  an official App Router or metadata file convention supported by the installed
  Next.js version, placed at an officially supported location and using a
  supported extension.
- Use the installed-version
  [file-system conventions](https://nextjs.org/docs/app/api-reference/file-conventions)
  and
  [metadata conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  as the filename source of truth. Do not maintain or trust a remembered list.
- Experimental conventions such as authorization interrupts or a global
  not-found file require the corresponding `next.config.ts` opt-in and an
  explicit product decision before use.
- Do not colocate arbitrary components, helpers, contexts, configuration,
  styles, tests, stories, fixtures, or runtime source under `app/`, even though
  Next.js can safely colocate non-routable files.
- Do not use an underscore-prefixed private folder as an escape hatch. Move
  non-routing code to its owning module or business-free package.

## Route naming

- Preserve exact lowercase names for framework files such as `page.tsx`,
  `layout.tsx`, `route.ts`, `loading.tsx`, and `error.tsx`.
- Name static URL segments in lowercase kebab-case.
- Name dynamic parameters in lower camel case: `[repositoryId]`,
  `[...segments]`, or `[[...segments]]`.
- Name route groups `(lowercase-kebab)`, parallel slots `@lowercase-kebab`, and
  intercepted segments with the official matcher plus a lowercase-kebab
  segment.
- Give organizational groups and slots delivery-oriented names. They do not
  define bounded contexts, domain subdomains, authorization scopes, or tenant
  boundaries.
- Never create two route trees that resolve to the same URL.

## Delivery responsibility

- Route files translate Next.js inputs such as `params`, `searchParams`,
  cookies, headers, and request bodies into calls to module public
  entrypoints.
- Route files may select layouts, metadata, redirects, not-found behavior, and
  route-level presentation. They must not implement reusable business rules,
  choose concrete adapters, or reach module internals.
- Import server behavior from `server-api.ts`, browser-safe UI from
  `browser-ui.ts`, Server Actions from `server-actions.ts`, and framework-free
  contracts from `integration-contracts.ts`.
- Keep route files as Server Components by default. If an official route file
  must be a Client Component, keep its imports browser-safe and move reusable
  interactive UI to the owning module.
- Treat Server Actions as inbound transport adapters. They validate and bound
  input, establish current authentication and authorization, call a public use
  case, map its result, and never become a database or domain service.
- Treat Route Handlers as HTTP adapters. They own supported methods, content
  type, request-size limits, DTO validation, status codes, headers, and safe
  error mapping; they do not own application workflow or domain decisions.
- Never serialize a domain object, ORM record, provider value, internal error,
  stack trace, SQL detail, path, or secret directly into a response.

## Route semantics

- `(group)` organizes routes without adding a URL segment.
- `@slot` is a layout prop; `children` is the implicit slot. Every parallel
  slot needs an intentional hard-navigation fallback, normally `default.tsx`.
- Intercepting matchers count route segments, not filesystem levels, and ignore
  route groups and slots.
- An intercepted modal or alternate view must also have a canonical
  non-intercepted route that works on direct navigation and refresh.

## Cache, mutation, and pre-routing work

- Make every cache choice explicit from data freshness, identity, tenant,
  authorization, and disclosure requirements. User-specific or sensitive data
  must not enter an unscoped shared cache.
- Define cache keys, lifetime, and invalidation together. A successful mutation
  invalidates or updates every affected view before the UI reports completion.
- Do not rely on remembered or implicit cache behavior. Verify the installed
  Next.js mode before using `use cache`, route configuration, revalidation, or
  Cache Components.
- Next.js 16 calls the former Middleware convention **Proxy**. An approved
  `proxy.ts` performs only lightweight pre-routing work such as bounded
  redirects, rewrites, or header changes; it is not a full authorization,
  session, data-access, or long-running workflow boundary. Adding it also
  requires an explicit source-root architecture decision because the current
  source contract does not permit that file.
- Redirect and callback targets derived from input must pass a strict
  same-origin or allowlist check.

## User-visible delivery

- Route-level presentation deliberately handles the applicable loading, empty,
  success, error, not-found, unauthenticated, and unauthorized states.
- Use `loading.tsx` or a focused Suspense boundary only for an independently
  pending region. Keep fallback layout stable and avoid blocking unrelated
  content with sequential data requests.
- Generate SEO metadata on the server from bounded, normalized, safely encoded
  values. Do not use a client-side effect as the only source of important
  indexable content.
- Accessibility is a functional requirement for every route: semantic
  structure, keyboard navigation, focus behavior, form labels, errors, and
  dynamic status announcements are part of completion.

## Change workflow

Before editing a route:

1. Resolve the filesystem path to its public URL.
2. Identify the owning bounded context and public entrypoint.
3. Confirm server/client reachability and authorization ownership.
4. For a slot, list layout props and hard-navigation fallbacks.
5. For interception, confirm the canonical route and matcher depth.

After editing, verify the relevant direct, client-navigation, refresh, Back,
Forward, loading, error, empty, not-found, and unauthorized paths. Run focused
tests, `pnpm typecheck`, `pnpm lint`, `pnpm architecture`, and `pnpm check` as
justified by the change.

## Official framework basis

- <https://nextjs.org/docs/app/getting-started/project-structure>
- <https://nextjs.org/docs/app/api-reference/file-conventions>
- <https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes>
- <https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes>
- <https://nextjs.org/docs/app/getting-started/server-and-client-components>
