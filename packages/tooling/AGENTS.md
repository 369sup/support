# Repository Tooling Workflow

This file governs `packages/tooling/**` and owns reusable repository tooling
that other configuration packages compose.

## ESLint rule ownership

- Shared architecture policy constants and the complete rule registry live
  under `src/architecture` and are exported through an explicit package
  subpath. Repository scripts consume that public export rather than copying
  entrypoint, layer, package, or rule metadata.
- Custom ESLint rule implementations and RuleTester cases live under this
  package. `packages/eslint-config` owns preset composition only.
- Preserve stable rule names, diagnostic messages, and `ARCH-*` identifiers.
- Add valid, invalid, and motivating boundary cases for every behavior change.
- Do not add autofixes unless the transformation is semantics-preserving.
- This package uses minimal bootstrap ESLint and Vitest configs because
  depending on `@support/eslint-config` or `@support/testing-config` would
  create a workspace dependency cycle.

## Validation

Run:

```text
pnpm --filter @support/tooling lint
pnpm --filter @support/tooling test
pnpm architecture
```
