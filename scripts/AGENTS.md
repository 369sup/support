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

- `architecture-checker.mjs` is the compatibility facade and orchestration
  entrypoint. Focused implementations live under `scripts/architecture/`.
- `check-architecture.mjs` is the repository CLI wrapper and accepts
  `required`, `generated`, `knowledge`, or `all` profiles.
- `@support/tooling/architecture/policy` owns shared rule metadata, public
  entrypoints, layer names, and workspace package policy.
- `scripts/architecture/catalog.mjs` owns lifecycle-specific README and
  source-freshness policy used by catalog validation and rendering.
- `scripts/architecture/source-graph.mjs` owns local source dependency graphs,
  cycle checks, client reachability, and declared context dependencies.
- `scripts/architecture/workspace-packages.mjs` owns manifest, export, import,
  and internal package-graph validation.
- `scripts/architecture/exceptions.mjs` and
  `scripts/architecture/generated-guidance.mjs` own their corresponding
  registry and deterministic-projection checks.
- `generate-module-map.mjs` writes only
  `docs/architecture/module-map.md` from the JSON catalog.
- `scaffold-context-readmes.mjs` creates missing bounded-context READMEs from
  catalog metadata and never overwrites existing semantic models.
- `generate-serena-memories.mjs` writes only the reviewed shared-memory files
  under `.serena/memories` from its explicit authority allowlist.
- Architecture behavior retains stable `ARCH-*` identifiers and focused
  positive and negative fixtures.

## Validation

```text
pnpm test:architecture
pnpm architecture
pnpm governance:generated
pnpm governance:knowledge
pnpm governance
pnpm architecture:docs
pnpm serena:memories
```

Inspect generated diffs and run `pnpm check` when practical. Mutation tests use
temporary directories and clean them in teardown.
