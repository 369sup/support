# Next.js Web Application Contract

Scope: `apps/web/**`. Inherits [`../AGENTS.md`](../AGENTS.md).

## Delta rules

- This package owns Next.js configuration, environment parsing,
  instrumentation, metadata defaults, build, and deployment binding.
- Runtime source remains under `src/app` and `src/modules`; package-level
  configuration must not become another product source root.
- Validate environment input at the package boundary. Keep secrets server-only;
  expose a value to the browser only through an intentional public contract.
- Keep instrumentation optional, server-safe, and non-fatal when an exporter or
  provider is absent.
- Do not move authorization or tenant decisions into Next.js configuration,
  middleware-like pre-routing code, metadata, or deployment settings.
- Check framework behavior against the version pinned by this package before
  changing routing, caching, rendering, or build configuration.

## Verification delta

Run the focused package check first. Configuration, environment,
instrumentation, or release changes also require the production build and a
review of emitted client/server boundaries.
