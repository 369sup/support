# App Router Architecture Contract

This file governs every file under `src/app/`.

`src/app` is the Next.js delivery layer. It owns URL composition, layouts,
route-level loading and error states, metadata, and the assembly of UI from
modules. Business rules do not belong here. Follow `src/modules/AGENTS.md` for
domain and application architecture.

## `app` versus `modules`: ownership boundary

The shortest reliable rule is:

```text
src/app     = WHERE and HOW a capability is exposed by Next.js
src/modules = WHAT the business capability does
```

`src/app` is a thin routing and composition shell. `src/modules` contains the
feature implementation. A route may disappear or change URL without forcing a
business use case to move. A business capability may gain an API, job, or
second page without duplicating its rules.

### Placement decision table

| Code or responsibility | Owner | Reason |
| --- | --- | --- |
| `page.tsx`, `layout.tsx`, `default.tsx`, `loading.tsx`, `error.tsx` | `src/app` | Next.js file convention and route lifecycle |
| Route groups, parallel slots, interception, URL params, route metadata | `src/app` | URL and presentation composition |
| Root providers, global CSS, manifest, robots, sitemap | `src/app` | Application delivery shell |
| Reading `params`, `searchParams`, `cookies()`, or `headers()` for a route | `src/app` | Next.js request binding |
| Mapping a module result to `redirect()`, `notFound()`, or an HTTP response | `src/app` | Framework response translation |
| Business invariant or policy | `src/modules/.../domain` | Business meaning must survive framework changes |
| Command/query orchestration | `src/modules/.../application` | One business use case |
| Repository or external-service interface | `src/modules/.../application/ports/outbound` | Capability required by the use case |
| Database, email, cache, or vendor SDK implementation | `src/modules/.../adapters/outbound` | Technology-specific implementation |
| Feature-specific Server Component or Client Component | `src/modules/.../adapters/inbound/next/ui` | UI belongs to the bounded context's feature |
| Feature-specific Server Action | `src/modules/.../adapters/inbound/next/server-actions` | Next inbound adapter for a business command |
| Reusable shadcn primitive with no business vocabulary | `src/components/ui` | Shared presentation primitive |
| Generic technical helper with no business meaning | `src/lib` | Shared technical utility |

Next.js imports are allowed in `src/app` and, when genuinely needed, under a
module's `adapters/inbound/next`. They are forbidden in `domain`, `application`,
and `contracts`.

### Five-question ownership test

Ask these questions in order before creating a file:

1. Is the filename or behavior required by the App Router? Put it in
   `src/app`.
2. Would this code still exist if the URL or Next.js were replaced? Put it in
   `src/modules`.
3. Does it contain business vocabulary such as project membership, invitation
   expiry, repository visibility, or notification preference? Put it in the
   owning bounded context under `src/modules`.
4. Is it a feature-specific React UI or Server Action? Put the implementation
   in that module's `adapters/inbound/next`, then expose it through a public
   entrypoint.
5. Is it a business-free reusable UI primitive or technical helper? Put it in
   `src/components/ui` or `src/lib`, not in `app` or a fake shared domain.

If questions 1 and 2 both appear true, split the code: retain only the
framework binding in `app`; move the framework-independent behavior into the
module.

### One feature, fully divided

Use this shape for a project-list capability. The tree shows ownership, not a
requirement to generate every optional file immediately.

```text
src/
├── app/
│   └── (console)/
│       └── projects/
│           ├── page.tsx                 # URL/searchParams + module composition
│           ├── loading.tsx              # route-level loading shell
│           ├── error.tsx                # route-level Next error boundary
│           └── [projectId]/
│               └── page.tsx             # params + canonical page composition
│
├── modules/
│   └── work-management/
│       └── project-management/
│           ├── index.ts                 # server-only public API/UI
│           ├── client.ts                # browser-safe public UI/hooks
│           ├── actions.ts               # public Server Actions only
│           ├── contracts.ts             # framework-free shared contracts
│           ├── domain/
│           │   └── aggregates/project/
│           │       └── project.aggregate.ts
│           ├── application/
│           │   ├── queries/list-projects/
│           │   │   ├── list-projects.query.ts
│           │   │   └── list-projects.handler.ts
│           │   ├── commands/create-project/
│           │   │   ├── create-project.command.ts
│           │   │   └── create-project.handler.ts
│           │   └── ports/outbound/
│           │       └── project.repository.port.ts
│           ├── adapters/
│           │   ├── inbound/next/
│           │   │   ├── ui/
│           │   │   │   ├── projects-screen.tsx
│           │   │   │   └── create-project-form.tsx
│           │   │   └── server-actions/
│           │   │       └── create-project.action.ts
│           │   └── outbound/persistence/repositories/
│           │       └── project.repository.adapter.ts
│           └── composition/
│               └── create-project-management.ts
│
├── components/
│   └── ui/
│       ├── button.tsx                    # generic shadcn primitive
│       └── dialog.tsx                    # generic shadcn primitive
│
└── lib/
    └── cn.ts                             # generic technical helper
```

The corresponding route remains intentionally small:

```tsx
// src/app/(console)/projects/page.tsx
import { ProjectsScreen } from "@/modules/work-management/project-management"

type ProjectsPageProps = Readonly<{
  searchParams: Promise<{ query?: string }>
}>

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const { query = "" } = await searchParams

  return <ProjectsScreen query={query} />
}
```

The route owns the Next.js `searchParams` contract. `ProjectsScreen` owns the
feature presentation and invokes the module's query through its internal
composition. The application query receives a plain string or DTO, never
Next.js `searchParams`.

### Public module entrypoints

Routes must import a bounded context through one of these files only:

| Entrypoint | May contain/export | May be imported by |
| --- | --- | --- |
| `index.ts` | Server facade, server-safe UI, application DTOs | Server Components, Route Handlers, server code |
| `client.ts` | Browser-safe components, hooks, serializable types | Client Components and server code |
| `actions.ts` | Only async exports backed by files with `"use server"` | Forms and Client/Server Components |
| `contracts.ts` | Framework-free schemas, commands, queries, event contracts | Other bounded contexts and adapters |

Never import paths such as
`@/modules/.../application/queries/.../handler` or
`@/modules/.../adapters/outbound/...` from `src/app`. A desired symbol that is
not publicly exported requires an ownership decision; it does not justify a
deep import.

### Data crossing the boundary

- Route input becomes primitives or an explicit application DTO before it
  reaches an application handler.
- Module output is an application result/view model, never an aggregate, ORM
  record, database row, or provider response.
- Props sent to Client Components must be serializable.
- Convert known module outcomes to HTTP status, `notFound()`, `redirect()`, or
  route UI in `src/app` or a module's explicit Next inbound adapter.
- Do not catch an unknown exception merely to erase it. Let the appropriate
  `error.tsx` boundary observe it.

### Import direction at a glance

```text
ALLOWED

src/app ───────────────▶ module index.ts / client.ts / actions.ts / contracts.ts
                                  │
                                  ▼
                      inbound adapter / composition
                                  │
                                  ▼
                         application ─────▶ domain
                                  │
                                  ▼
                           outbound port
                                  ▲
                                  │
                           outbound adapter

FORBIDDEN

src/modules/domain ────X──▶ src/app or next/*
src/modules/application X──▶ React, Next.js, ORM, provider SDK
src/app ───────────────X──▶ private module internals
module A ──────────────X──▶ module B internals or database tables
```

### Common placement examples

| Example | Correct location |
| --- | --- |
| Console sidebar decides where slots render | `src/app/(console)/layout.tsx` |
| Generic sidebar primitive | `src/components/ui` |
| Project status badge with domain-specific labels | Project module `adapters/inbound/next/ui` |
| Whether a member may archive a project | Project module `domain` |
| Check the current session for a route | Thin `src/app` binding calling the identity module |
| Whether that identity has a business permission | Owning module policy/use case |
| Parse `[projectId]` from `params` | `src/app/.../[projectId]/page.tsx` |
| Validate that a project ID exists and is accessible | Project application/domain flow |
| Prisma/Drizzle project query | Project module outbound persistence adapter |
| `revalidatePath()` after a form command | Project module Next Server Action or thin `src/app` action |
| Email invitation expiry rule | Invitation/identity domain |
| Resend email call | Owning module outbound email adapter |

## Non-negotiable mental model

Read a route path from left to right and classify every folder before editing
it. Parentheses and `@` have different meanings.

| Syntax | Name | Adds a URL segment? | Becomes a layout prop? | Purpose |
| --- | --- | --- | --- | --- |
| `dashboard/` | route segment | Yes | No | Public URL hierarchy |
| `[projectId]/` | dynamic segment | Yes | No | One dynamic URL part |
| `[...slug]/` | catch-all segment | Yes | No | One or more dynamic URL parts |
| `[[...slug]]/` | optional catch-all | Maybe | No | Zero or more dynamic URL parts |
| `(console)/` | route group | No | No | Organize routes and share a layout |
| `@analytics/` | named slot | No | Yes: `analytics` | Render a parallel UI branch |
| `children` | implicit slot | No | Yes | The ordinary, unnamed route branch |
| `(.)projects/` | intercepting route | No extra segment | Through its slot | Intercept a same-level route |
| `(..)projects/` | intercepting route | No extra segment | Through its slot | Intercept a route one segment above |
| `_components/` | private folder | No | No | Opt a subtree out of routing |

Hard rules:

1. `(console)` and `(public)` are route groups, not URL segments, not parallel
   routes, and not domain bounded contexts.
2. `@slot` is a named UI outlet, not a URL segment. Never link to
   `/@analytics` and never expect `params` to contain a slot name.
3. A slot is passed to the `layout.tsx` at the same route-segment level as a
   prop whose name is the folder name without `@`.
4. `children` is the implicit parallel slot. Conceptually,
   `app/page.tsx` is equivalent to `app/@children/page.tsx`, but do not create
   an `@children` folder.
5. Intercepting-route matchers count route segments, not filesystem folders.
   Route groups and parallel slots do not count.
6. A folder alone is not a public route. A route becomes reachable only when a
   `page.tsx` or `route.ts` exposes it.

## Canonical complete structure

The following is the reference structure for this repository. It includes all
current top-level routes plus a complete parallel-route example. Files marked
`[example]` describe the intended extension point; the tree is an architecture
contract, not a claim that every example file already exists.

```text
src/
├── app/
│   ├── AGENTS.md                         # this contract
│   ├── favicon.ico                       # browser icon
│   ├── globals.css                       # global Tailwind/theme styles
│   ├── layout.tsx                        # root layout; <html> and <body>
│   ├── page.tsx                          # /
│   ├── global-error.tsx                  # root error boundary; Client Component
│   ├── not-found.tsx                     # root 404 UI
│   ├── manifest.ts                       # /manifest.webmanifest metadata route
│   ├── robots.ts                         # /robots.txt metadata route
│   ├── sitemap.ts                        # /sitemap.xml metadata route
│   │
│   ├── (console)/                        # route group; omitted from every URL
│   │   ├── layout.tsx                    # console shell; receives children/modal
│   │   ├── account/
│   │   │   └── page.tsx                  # /account
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # [example] receives children/activity/analytics
│   │   │   ├── page.tsx                  # /dashboard; implicit children slot
│   │   │   ├── default.tsx               # [example] hard-load fallback for children
│   │   │   ├── loading.tsx               # [example] children loading boundary
│   │   │   ├── error.tsx                 # [example] children error boundary; client
│   │   │   ├── @activity/                 # [example] slot prop: activity
│   │   │   │   ├── page.tsx              # /dashboard activity panel
│   │   │   │   ├── default.tsx           # fallback when active state is unknown
│   │   │   │   ├── loading.tsx           # slot-local loading state
│   │   │   │   └── error.tsx             # slot-local error boundary; client
│   │   │   └── @analytics/                # [example] slot prop: analytics
│   │   │       ├── layout.tsx             # optional tabs/layout inside this slot
│   │   │       ├── page.tsx               # /dashboard default analytics panel
│   │   │       ├── default.tsx            # hard-load fallback for unmatched URL
│   │   │       ├── loading.tsx            # slot-local loading state
│   │   │       ├── error.tsx              # slot-local error boundary; client
│   │   │       ├── page-views/
│   │   │       │   └── page.tsx           # /dashboard/page-views
│   │   │       └── visitors/
│   │   │           └── page.tsx           # /dashboard/visitors
│   │   ├── notifications/
│   │   │   └── page.tsx                  # /notifications
│   │   ├── projects/
│   │   │   ├── page.tsx                  # /projects
│   │   │   └── [projectId]/               # [example] canonical full-page route
│   │   │       └── page.tsx              # /projects/:projectId
│   │   ├── repositories/
│   │   │   └── page.tsx                  # /repositories
│   │   ├── settings/
│   │   │   └── page.tsx                  # /settings
│   │   └── @modal/                        # [example] slot prop on console layout
│   │       ├── default.tsx                # returns null on hard load/no match
│   │       ├── page.tsx                   # returns null at the console root
│   │       ├── [...catchAll]/
│   │       │   └── page.tsx              # returns null; clears stale modal UI
│   │       └── (.)projects/               # same route level; @modal is ignored
│   │           └── [projectId]/
│   │               └── page.tsx           # modal view for /projects/:projectId
│   │
│   ├── (public)/                          # route group; omitted from every URL
│   │   ├── layout.tsx                    # public/auth/legal shell
│   │   ├── accept-invitation/
│   │   │   └── page.tsx                  # /accept-invitation
│   │   ├── accessibility/
│   │   │   └── page.tsx                  # /accessibility
│   │   ├── docs/
│   │   │   └── page.tsx                  # /docs
│   │   ├── forgot-password/
│   │   │   └── page.tsx                  # /forgot-password
│   │   ├── logout/
│   │   │   └── page.tsx                  # /logout
│   │   ├── privacy/
│   │   │   └── page.tsx                  # /privacy
│   │   ├── reset-password/
│   │   │   └── page.tsx                  # /reset-password
│   │   ├── search/
│   │   │   └── page.tsx                  # /search
│   │   ├── sign-in/
│   │   │   └── page.tsx                  # /sign-in
│   │   ├── sign-up/
│   │   │   └── page.tsx                  # /sign-up
│   │   ├── terms/
│   │   │   └── page.tsx                  # /terms
│   │   └── verify-email/
│   │       └── page.tsx                  # /verify-email
│   │
│   ├── api/                               # [example] HTTP adapters only
│   │   └── health/
│   │       └── route.ts                  # /api/health
│   └── _components/                       # [example] app-only, non-routable UI
│       └── route-shell.tsx
│
└── modules/
    └── <subdomain>/
        └── <bounded-context>/             # domain/application ownership lives here
```

Do not copy every optional file into every route. Add a convention file only
when that route segment needs its behavior. The exception is `default.tsx` for
parallel slots: add it deliberately according to the fallback rules below.

## Exact URL resolution

Use this table before creating or moving routes.

| Filesystem path | Browser URL | Explanation |
| --- | --- | --- |
| `(console)/dashboard/page.tsx` | `/dashboard` | Route group is omitted |
| `(public)/sign-in/page.tsx` | `/sign-in` | Route group is omitted |
| `(console)/dashboard/@analytics/page.tsx` | `/dashboard` | Slot is omitted |
| `(console)/dashboard/@analytics/visitors/page.tsx` | `/dashboard/visitors` | Only real segments affect URL |
| `(console)/projects/[projectId]/page.tsx` | `/projects/:projectId` | Canonical full page |
| `(console)/@modal/(.)projects/[projectId]/page.tsx` | `/projects/:projectId` | Intercepted presentation during soft navigation |
| `_components/route-shell.tsx` | none | Private folder is excluded from routing |

Two filesystem paths may intentionally represent the same browser URL only
for an intercepting-route presentation of a canonical route. Do not create the
same URL independently under two route groups; for example,
`(console)/settings/page.tsx` and `(public)/settings/page.tsx` would conflict.

## Parallel route contract

Parallel routes render named slots together inside their common parent layout.
Slots are useful when sibling UI regions need independent navigation, loading,
or error states.

### Parent layout signatures

Keep slot props explicit and typed. A slot without a matching layout prop is an
orphan and must not be added.

```tsx
// src/app/(console)/layout.tsx
import type { ReactNode } from "react"

type ConsoleLayoutProps = Readonly<{
  children: ReactNode
  modal: ReactNode
}>

export default function ConsoleLayout({
  children,
  modal,
}: ConsoleLayoutProps) {
  return (
    <>
      <div className="min-h-dvh">{children}</div>
      {modal}
    </>
  )
}
```

```tsx
// src/app/(console)/dashboard/layout.tsx
import type { ReactNode } from "react"

type DashboardLayoutProps = Readonly<{
  children: ReactNode
  activity: ReactNode
  analytics: ReactNode
}>

export default function DashboardLayout({
  children,
  activity,
  analytics,
}: DashboardLayoutProps) {
  return (
    <main>
      {children}
      <div className="grid gap-6 lg:grid-cols-2">
        {activity}
        {analytics}
      </div>
    </main>
  )
}
```

Prefer simple JavaScript identifiers for slot names: `@modal`, `@activity`,
and `@analytics`. Avoid names such as `@project-activity` that require awkward
prop aliasing.

### `default.tsx` fallback rules

Next.js can retain each slot's active subpage during client-side soft
navigation. After a full reload, it cannot recover active state for a slot that
does not match the current URL. It renders that slot's `default.tsx`; without a
fallback, the response can be a 404.

Apply these rules:

1. Every named slot must have a deliberate `default.tsx`, unless a hard-refresh
   404 is an explicitly documented product requirement.
2. Add `default.tsx` for the implicit `children` slot when a sibling slot can
   own a URL that `children` does not match. At `dashboard/`, that file is
   `dashboard/default.tsx`, not `dashboard/@children/default.tsx`.
3. A panel fallback may render stable placeholder UI. A modal fallback normally
   returns `null`.
4. `default.tsx` is not a replacement for `page.tsx`, `not-found.tsx`, or
   `loading.tsx`; each has a separate responsibility.
5. Test every parallel-route URL by direct entry and browser refresh, not only
   by clicking links from another page.

Minimal modal fallback:

```tsx
// src/app/(console)/@modal/default.tsx
export default function Default() {
  return null
}
```

### Soft navigation versus hard navigation

| Action | Expected slot behavior |
| --- | --- |
| `<Link>` or `router.push()` inside the app | Matching slot changes; unmatched slots preserve their active subpage |
| Browser refresh or direct URL entry | Matching slots render; unmatched slots render `default.tsx` |
| Missing `default.tsx` on an unmatched slot | May produce a 404 |
| Browser Back/Forward | Slot state follows client navigation history |

Do not infer correctness from a soft-navigation-only test. Parallel routes are
specifically sensitive to the difference between client navigation and a new
request.

## Intercepted modal contract

Use a parallel `@modal` slot with an intercepting route when one URL needs both:

- a modal presentation during in-app navigation, and
- a canonical full page during direct entry or refresh.

For project details:

```text
(console)/
├── layout.tsx                         # renders children and modal
├── projects/
│   ├── page.tsx                       # project list
│   └── [projectId]/
│       └── page.tsx                   # canonical full page
└── @modal/
    ├── default.tsx                    # null
    ├── page.tsx                       # null
    ├── [...catchAll]/
    │   └── page.tsx                   # null after unrelated navigation
    └── (.)projects/
        └── [projectId]/
            └── page.tsx               # modal presentation
```

`(.)projects` means "the `projects` route at the same route-segment level."
The `@modal` folder is ignored when calculating that level.

Expected behavior:

1. A link from `/projects` to `/projects/123` performs soft navigation and
   renders the intercepted page in `modal` over the preserved project list.
2. Opening `/projects/123` directly, or refreshing it, renders the canonical
   `projects/[projectId]/page.tsx` full page.
3. Closing the modal uses `router.back()` when navigation history represents
   the opening action. Provide a normal `<Link>` fallback when users may land
   without that history.
4. The catch-all null route prevents modal content from remaining visible
   after navigation to another console URL.
5. Keep the modal shell reusable, but keep project data and use cases in the
   owning module.

Matcher reference:

| Matcher | Target location |
| --- | --- |
| `(.)` | Same route-segment level |
| `(..)` | One route-segment level above |
| `(..)(..)` | Two route-segment levels above |
| `(...)` | From the `app` root |

Never calculate these matchers by counting `@slot` or `(group)` folders.

## Active-segment awareness

When a navigation component must know which subpage is active inside a named
slot, use `useSelectedLayoutSegment(slotKey)` or
`useSelectedLayoutSegments(slotKey)`. The slot key is the folder name without
`@`, for example `analytics`.

This requires a Client Component. Keep the client boundary around the smallest
interactive navigation component; do not convert the whole layout to a Client
Component merely to read active slot state.

## Route convention responsibilities

| File | Responsibility |
| --- | --- |
| `layout.tsx` | Persistent shell and slot composition |
| `template.tsx` | Remounting wrapper when layout persistence is undesirable |
| `page.tsx` | Routable UI endpoint |
| `loading.tsx` | Segment-level Suspense fallback |
| `error.tsx` | Segment-level error boundary; must be a Client Component |
| `global-error.tsx` | Root error UI; must be a Client Component and provide `<html>`/`<body>` |
| `not-found.tsx` | Not-found UI for `notFound()` or unmatched resources |
| `default.tsx` | Parallel-slot fallback on a new request |
| `route.ts` | HTTP route handler; do not place beside `page.tsx` at the same segment |
| `manifest.ts`, `robots.ts`, `sitemap.ts` | Metadata routes |

Slot branches may define their own `loading.tsx` and `error.tsx`. That
independence is one of the principal reasons to use parallel routes.

## Route groups and root layouts

- Route groups organize routes and may introduce shared layouts without
  changing URLs.
- Never use a route group name as authorization evidence. `(console)` does not
  secure its children; authentication and authorization must be enforced by
  the appropriate server-side boundary.
- Do not create duplicate resolved URLs across `(console)` and `(public)`.
- Keep the single root `src/app/layout.tsx` unless multiple root layouts are a
  deliberate product decision. Navigating between different root layouts
  causes a full page load.
- A route group is a presentation concern. A bounded context under
  `src/modules` is a business ownership boundary. Do not map the two concepts
  by punctuation or folder name alone.

## Dependency direction

Allowed:

```text
src/app route/layout
        │
        ▼
src/modules/<subdomain>/<bounded-context> public entrypoint
        │
        ▼
application ports and use cases → domain
        ▲
        │
infrastructure adapters
```

Disallowed:

- Domain entities importing `next/*`, React, shadcn, or route files.
- `page.tsx` implementing business invariants or database queries directly.
- One route importing another route's private implementation.
- A slot being used as a service locator or dependency container.
- Deep imports into another bounded context's internals.

Route files should parse transport input, call a module's public application
API, and render or translate the result. Reusable shadcn components belong in
the shared UI layer; domain-specific composition belongs with the owning
module or in a thin app adapter.

## Dynamic rendering consistency

Slots at the same route segment share rendering characteristics. If one slot
at a level is dynamic, treat the route level as dynamic during design and
review. Do not assume that one sibling slot can be independently forced static
while another is dynamic.

Make caching and dynamic API usage explicit at the module or route boundary.
Do not hide request-dependent behavior in a shared visual component.

## Change procedure for Codex

Before editing routes:

1. Read this file and the nearest deeper `AGENTS.md`, if one exists.
2. Resolve every affected filesystem path to its browser URL.
3. Identify the parent layout and list its exact slot props.
4. Decide what each named slot and the implicit `children` slot render on a
   hard reload.
5. If using interception, calculate the matcher from route segments while
   ignoring route groups and slots.
6. Confirm the canonical full-page route exists before adding an intercepted
   presentation.
7. Check that no other route group resolves to the same URL.
8. Keep domain and application behavior in `src/modules`.

After editing routes:

1. Run the repository's lint, type-check, and build commands.
2. Test ordinary direct navigation for every changed URL.
3. Test client-side soft navigation between slot subpages.
4. Refresh every slot subpage and verify `default.tsx` behavior.
5. Test Back and Forward navigation.
6. For intercepted modals, test open, close, direct URL entry, refresh, and
   navigation away while the modal is open.
7. Verify loading, error, empty, and unauthorized states at their intended
   boundaries.

## Definition of done

A route change is complete only when:

- Its resolved URL is documented or obvious from this contract.
- Every `@slot` has a same-level typed layout prop.
- Every unmatched hard-navigation state has an intentional `default.tsx` or a
  documented reason to return 404.
- An intercepted route has a canonical non-intercepted full-page counterpart.
- Soft navigation and hard navigation both behave correctly.
- No duplicate URL exists across route groups.
- Route files remain thin and use module public entrypoints.
- Relevant loading, error, not-found, accessibility, and responsive states are
  verified.
- Lint, type-check, and build checks pass.

## Documentation basis

The Context7 library identifier resolved for this project is
`/vercel/next.js/v16.2.9`. The attempted Context7 queries for this update were
blocked by its monthly quota, so no unavailable Context7 response is treated as
evidence. This contract was cross-checked against the official Next.js 16.2.10
documentation instead:

- <https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes>
- <https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes>
- <https://nextjs.org/docs/app/api-reference/file-conventions/route-groups>
- <https://nextjs.org/docs/app/getting-started/project-structure>

When framework behavior changes, re-query Context7 and the official current
Next.js documentation, then update this contract before relying on memory.
