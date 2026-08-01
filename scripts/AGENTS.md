# Repository Script Workflow

This file governs `scripts/**`. Cross-platform requirements are inherited from
the root `AGENTS.md`.

## Script contract

- Resolve repository paths from the script location, not the caller's working
  directory, personal paths, or shell expansion.
- Keep scripts deterministic and non-interactive. Validate external input and
  fail with a nonzero exit code plus an actionable message.
- A checker reports without rewriting source. A generator writes only its
  declared outputs. Do not hide dependency installation, cleanup, or
  destructive migration inside either.
- Never read or print credentials, environment files, or customer data unless
  that reviewed input is the script's explicit purpose.

## Architecture automation

- `architecture.mjs` is the library and CLI entrypoint. Its `check` command
  accepts `required`, `generated`, `knowledge`, or `all` profiles; `generate`
  writes the module-map, route README, and typed route projections; `scaffold`
  creates missing context READMEs without overwriting existing models.
- `@support/tooling/architecture/policy` owns shared rule metadata, public
  entrypoints, layer names, and workspace package policy.
- `scripts/architecture/context.mjs` owns lifecycle-specific README and
  source-freshness policy used by catalog validation and rendering.
- `scripts/architecture/source.mjs` owns local source dependency graphs,
  cycle checks, client reachability, and declared context dependencies.
- `scripts/architecture/workspace.mjs` owns manifest, export, import,
  and internal package-graph validation.
- `scripts/architecture/governance.mjs` owns exception, violation selection,
  and deterministic-projection checks.
- `scripts/architecture/routes.mjs` owns route-catalog discovery, validation,
  typed-contract rendering, and per-URL README projection.
- Architecture behavior retains stable `ARCH-*` identifiers and focused
  positive and negative fixtures.

Serena lifecycle, memory, and tool management use the installed official
`serena` and `serena-hooks` commands. Do not recreate them under `scripts/**`.

## Validation

```text
pnpm test:architecture
pnpm architecture
pnpm governance:generated
pnpm governance:knowledge
pnpm governance
pnpm architecture:docs
pnpm test:hooks
```

Inspect generated diffs and run `pnpm check` when practical. Mutation tests use
temporary directories and clean them in teardown.
