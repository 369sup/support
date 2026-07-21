# Support

A Next.js App Router support application organized as a Turborepo workspace.

The product application lives in `apps/web`. Its source has two roots only:

- `apps/web/src/app` for Next.js delivery and route composition.
- `apps/web/src/modules/<subdomain>/<bounded-context>` for product and platform capabilities.

Reusable repository configuration is owned by `packages/eslint-config`,
`packages/typescript-config`, and `packages/test-config`; business-free UI is
owned by `packages/shadcn`, with official primitives under `src/ui` and custom
product-agnostic compositions under `src/custom`. Product contexts stay
inside the application and are not workspace packages.

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

Set `NEXT_PUBLIC_SITE_URL` in deployed environments so metadata routes emit the
canonical production URL.
