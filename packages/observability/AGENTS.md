# Observability Workflow

This file governs `packages/observability/**` and owns vendor-neutral logging,
tracing, and metrics APIs.

## Runtime boundary

- Keep Next.js, exporters, collectors, deployment environment parsing, and
  provider-specific SDK initialization in the consuming application.
- Logging is Node-only. Tracing and metrics use `@opentelemetry/api` and must
  remain safe when no SDK is registered.
- Do not import product modules or encode domain attributes in this package.
- Never log authorization values, cookies, tokens, passwords, secrets, full
  request bodies, or unreviewed provider payloads. Extend redaction tests when
  a new sensitive shape is introduced.
- Keep attribute names stable and low-cardinality when they are used for
  metrics.

## Validation

Run:

```text
pnpm --filter @support/observability lint
pnpm --filter @support/observability typecheck
pnpm --filter @support/observability test
pnpm --filter @support/web build
```
