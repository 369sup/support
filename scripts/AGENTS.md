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
  writes the module-map projection; `scaffold` creates missing context
  READMEs without overwriting existing models.
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
- `serena-memories.mjs` writes only the reviewed shared-memory files
  under `.serena/memories` from its explicit authority allowlist.
- Architecture behavior retains stable `ARCH-*` identifiers and focused
  positive and negative fixtures.

## Serena local-memory automation

- `scripts/memory/**` owns the candidate schema, safe local store,
  deterministic consolidation, conflict resolution, TTL/archive policy,
  rendered local memories, CLI, and tests.
- The engine may read and write only `.serena/memories/local/**`. It must never
  read transcripts, environment files, provider payloads, source trees, or
  credentials.
- Machine state and raw episodes remain ignored local data. Shared committed
  memories continue to be owned exclusively by
  `serena-memories.mjs`.
- Exclusive ownership is permanent. Activation quarantines any unmanaged
  visible local memory without interpreting its contents.
- In exclusive mode, activation quarantines unknown visible local memories
  without interpreting their contents and records only bounded metadata in
  `local/unresolved`.
- Keep the engine dependency-free so Serena activation works before workspace
  package installation.

## Validation

```text
pnpm test:architecture
pnpm architecture
pnpm governance:generated
pnpm governance:knowledge
pnpm governance
pnpm architecture:docs
pnpm serena:memories
pnpm test:memory
pnpm memory:validate
```

Inspect generated diffs and run `pnpm check` when practical. Mutation tests use
temporary directories and clean them in teardown.
