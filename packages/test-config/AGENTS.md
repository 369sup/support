# Test Configuration Workflow

This file governs `packages/test-config/**`.

## Preset contract

- Export small factory functions for shared Vitest and Playwright defaults.
- Accept consumer-specific paths, URLs, and server commands as explicit named
  options. Do not embed `apps/web` paths, ports, routes, credentials, or product
  fixtures in this package.
- Keep factories deterministic except for documented environment switches such
  as CI behavior. Do not mutate imported config objects or global test state.
- Keep failure artifacts in the standard ignored `coverage`, `test-results`,
  `playwright-report`, or `blob-report` locations.
- Add a new preset only when at least two consumers need the same test-runtime
  contract. A single application's test behavior remains in that application.

## Dependency and validation rules

Test runners are peer dependencies when consumers execute them. Configuration
implementation dependencies must remain explicit in this package.

Run:

```text
pnpm --filter @support/test-config typecheck
pnpm test
```

When changing Playwright behavior, also run the affected application's E2E
suite. When changing Vitest behavior, run representative Node rule and
architecture tests.
