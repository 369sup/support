# Web Application Workflow

This file governs `apps/web/**`. Source code follows the separate delivery and
business workflows in [`src/app/AGENTS.md`](src/app/AGENTS.md) and
[`src/modules/AGENTS.md`](src/modules/AGENTS.md). Architecture and import rules
remain authoritative in
[`docs/architecture/AGENTS.md`](../../docs/architecture/AGENTS.md).

## Package-owned concerns

- `public/` contains immutable browser-served assets. Do not place secrets,
  customer content, source data, or authorization-protected files there.
- `tests/e2e/` owns cross-route browser behavior. Other tests remain with their
  owning module or package.
- Keep `next.config.ts`, `postcss.config.mjs`, `playwright.config.ts`,
  `eslint.config.mjs`, and `tsconfig.json` thin consumers of shared contracts.
- Validate environment variables at a server-only boundary. Never expose an
  unprefixed secret through client-reachable code.

## Configuration workflow

Before changing a package dependency, path alias, compiler preset, or Next.js
transpilation setting, identify its runtime consumer and confirm the change
preserves the architecture dependency graph. Configuration-only packages do
not belong in `transpilePackages`.

## Validation

```text
pnpm --filter @support/web typecheck
pnpm --filter @support/web lint
pnpm --filter @support/web build
pnpm --filter @support/web test:e2e
```

For route or visual changes, exercise direct and client navigation at relevant
viewport sizes. Do not commit ignored Playwright reports or test artifacts.
