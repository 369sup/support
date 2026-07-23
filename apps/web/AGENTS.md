# Next.js Web Application Contract

This file governs `apps/web/**` and inherits `apps/AGENTS.md`. Source code
inherits [`src/AGENTS.md`](src/AGENTS.md); `src/app` and `src/modules` then add
their own delivery and bounded-context rules.

## Package structure

- Keep runtime source under `src/`. The only permitted source roots and their
  dependency direction are defined by `src/AGENTS.md`.
- Keep the package manifest, Next.js and tool configuration, runtime
  instrumentation entrypoints, and application-wide tests at the package
  boundary. Do not use the package root as an alternate source directory.
- `public/` contains intentionally public, browser-served static assets only.
  Never place secrets, personal data, customer content, source data, or
  authorization-protected files there.
- `tests/e2e/` owns cross-route browser journeys. Unit and integration tests
  stay with the source boundary whose behavior they verify.

## Naming and configuration

- Preserve exact filenames required by Next.js and the configured tools, such
  as `next.config.ts`, `instrumentation.ts`, and `playwright.config.ts`.
- Name non-framework files and directories in lowercase kebab-case. Do not add
  generic roots such as `components`, `lib`, `shared`, `common`, `utils`, or
  `services`.
- Keep configuration files thin. Before changing a dependency, alias,
  transpilation rule, compiler option, or runtime setting, identify its
  consumer and verify that the architecture dependency graph remains valid.
- Validate environment variables at a server-only boundary. Only values
  intentionally prefixed with `NEXT_PUBLIC_` may be reachable from client code.

## Runtime boundary

- Keep Node-only logging, tracing, metrics, exporters, and secret-bearing
  initialization out of browser-reachable imports.
- Application instrumentation must remain lazy, build-safe, and free of
  import-time network or credential side effects.
- Do not encode product authorization, tenant, billing, invitation, or
  personal-data policy in framework configuration.
- Centralize server environment parsing and fail early for missing or invalid
  required values. Business source receives validated configuration; it does
  not scatter direct `process.env` reads.
- Treat every value sent to the browser as public. Serialize only fields needed
  by the current view, and never expose credentials, private URLs, provider
  payloads, server paths, or infrastructure instances.
- Keep operational telemetry structured and correlatable without recording
  secrets, tokens, cookies, request bodies, or full personal data. Audit events
  remain a separate product contract owned by their bounded context.
- Every application-owned external client defines timeout, cancellation, safe
  retry, and degradation behavior at its adapter boundary. Do not hide
  uncontrolled network work in configuration or instrumentation.

## Build and release

- Builds, type checks, lint, and tests must be reproducible from the committed
  manifest and lockfile without global packages, personal files, or manual
  production steps.
- Keep environment-specific values outside source while preserving one
  configuration schema. Browser-exposed variables require explicit review and
  the `NEXT_PUBLIC_` prefix.
- Isolate framework and major dependency upgrades from product behavior.
  Review the installed-version migration guide, deprecations, and generated
  lockfile changes before accepting them.

## Validation

Run the narrowest relevant command first:

```text
pnpm --filter @support/web typecheck
pnpm --filter @support/web lint
pnpm --filter @support/web build
pnpm --filter @support/web test:e2e
```

For routing or visual changes, verify direct navigation, client navigation,
refresh, and the affected responsive states. Do not commit generated
Playwright reports or test artifacts.
