# Support

A non-code product platform built with Next.js App Router and
organized as a Turborepo workspace. The product models users, enterprises,
organizations, teams, repositories, issues, discussions, projects,
notifications, permissions, governance, commerce, and integrations.

Git storage and repository content, commits, branches, tags, diffs, merge,
pull requests and code review, Actions execution, source-backed package
payloads, and source-backed site builds are outside the product boundary.
Package metadata and app-owned site publication remain planned non-Git
capabilities. See the generated
[`docs/architecture/module-map.md`](docs/architecture/module-map.md) for the
authoritative context catalog and deferred capabilities.

The product application lives in `apps/web`. Its source has two roots only:

- `apps/web/src/app` for Next.js delivery and route composition, governed by
  [`apps/web/route-map.json`](apps/web/route-map.json).
- `apps/web/src/modules/<subdomain>/<bounded-context>` for product and platform capabilities.

Reusable repository configuration is owned by `packages/eslint-config`,
`packages/typescript-config`, `packages/testing-config`, and
`packages/tooling`. Framework-neutral wire schemas live in
`packages/contracts`, server logging and OpenTelemetry APIs live in
`packages/observability`, and business-free UI is owned by `packages/shadcn`.
Official UI primitives remain under `src/ui`; custom product-agnostic
compositions remain under `src/custom`. Product contexts stay inside the
application and are not workspace packages.

Architecture, naming, module-map, and exception rules are documented under
`docs/architecture` and enforced by `pnpm architecture`.

## Development

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before changing code. It defines the
review, verification, documentation, dependency, and commit workflow.

```text
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

### Runtime composition

Support has one application composition for development, preview, and
production:

- Supabase Auth owns credentials, MFA, and browser sessions through SSR
  cookies.
- Supabase PostgreSQL owns durable product state.
- Supabase Storage owns media objects while PostgreSQL owns their metadata.
- Unit tests inject isolated in-memory adapters directly. Environment variables
  never select those fixtures for the application runtime.

Copy [`apps/web/.env.example`](apps/web/.env.example) to
`apps/web/.env.local` and provide the required Supabase values. Production
adapters fail closed when their configuration is first resolved. Local
development may target a local Supabase stack or an explicitly selected remote
project, but it uses the same provider boundaries.

Use [`docs/architecture/module-map.json`](docs/architecture/module-map.json)
for current bounded-context status and
[`apps/web/route-map.json`](apps/web/route-map.json) for route materialization.
Do not infer implemented behavior from a directory, README, or dated report.

Authentication routes use Supabase sessions in every environment. Test-only
fixtures and in-memory adapters must not be treated as durable storage or
external provider integrations.

## Commands

- `pnpm build` - create a production build through Turborepo.
- `pnpm lint` - run ESLint and immediate architecture boundary rules.
- `pnpm typecheck` - run TypeScript without emitting files.
- `pnpm architecture` - validate structure, graph, module map, and exceptions.
- `pnpm test` - run ESLint-rule and architecture automation tests with Vitest.
- `pnpm test:e2e` - run Playwright Chromium against the production server.
- `pnpm check` - run the browser-free local gate.
- `pnpm check:full` - add production build and E2E verification.
- `pnpm check:affected` - run affected package checks for pull requests.
- `pnpm turbo:dry-run` - inspect the package and task graph.
- `pnpm architecture:docs` - regenerate the module map, per-URL route READMEs,
  and typed route contracts.

Vercel deployments use `VERCEL_PROJECT_PRODUCTION_URL` automatically so
metadata routes emit the canonical production URL. Set `NEXT_PUBLIC_SITE_URL`
only when a custom canonical URL must override the Vercel production domain.

## Observability

Server logs are newline-delimited JSON and default to the `info` level. Set
`LOG_LEVEL` to `debug`, `info`, `warn`, `error`, or `silent` to override it.
Request error logging records only reviewed route metadata and excludes raw
headers, request bodies, and query strings.

Trace and metric export is opt-in. Set `OTEL_EXPORTER_OTLP_ENDPOINT` to the
base HTTP endpoint of an OTLP collector to enable both signals. Standard
`OTEL_SERVICE_NAME`, `OTEL_RESOURCE_ATTRIBUTES`, and
`OTEL_EXPORTER_OTLP_HEADERS` variables are passed through to OpenTelemetry.
With no endpoint, exporters are not loaded and structured logging remains
active. Copy `apps/web/.env.example` for the supported variables; never commit
real collector credentials.
