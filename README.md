# Support

A non-code product platform built with Next.js App Router and
organized as a Turborepo workspace. The product models users, enterprises,
organizations, teams, repositories, issues, discussions, projects,
notifications, permissions, governance, commerce, and integrations.

Git storage and repository content, commits, branches, tags, diffs, merge,
pull requests and code review, Actions, and other code products are outside the
product boundary. See the generated
[`docs/architecture/module-map.md`](docs/architecture/module-map.md) for the
authoritative context catalog and deferred capabilities.

The product application lives in `apps/web`. Its source has two roots only:

- `apps/web/src/app` for Next.js delivery and route composition.
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

```text
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Commands

- `pnpm build` - create a production build through Turborepo.
- `pnpm lint` - run ESLint and immediate architecture boundary rules.
- `pnpm typecheck` - run TypeScript without emitting files.
- `pnpm architecture` - validate structure, graph, module map, and exceptions.
- `pnpm test` - run ESLint-rule and architecture-checker tests with Vitest.
- `pnpm test:e2e` - run Playwright Chromium against the production server.
- `pnpm check` - run the browser-free local gate.
- `pnpm check:full` - add production build and E2E verification.
- `pnpm check:affected` - run affected package checks for pull requests.
- `pnpm turbo:dry-run` - inspect the package and task graph.
- `pnpm architecture:docs` - regenerate the human-readable module map.

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
