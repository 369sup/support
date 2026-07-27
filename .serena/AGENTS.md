# Serena Project and Memory Workflow

Scope: `.serena/**`. Source-code workflow remains in the repository and source
tree `AGENTS.md` files; this file owns Serena project configuration and the
automatic local-memory contract.

## Project configuration

- `project.yml` contains portable discovery and backend settings only. Keep
  paths repository-relative and never commit credentials, installation paths,
  IDE user state, generated indexes, or customer data.
- The required semantic backend is JetBrains. Confirm the exact worktree root,
  backend connection, and indexing state before trusting symbol, reference, or
  diagnostic results.
- Keep `initial_prompt` empty; repository invariants belong in `AGENTS.md`.
- Automatic onboarding remains disabled. Shared memory is generated from a
  reviewed allowlist and is never required for ordinary repository operation.
- When Serena is unavailable, identify the failed layer and use the narrowest
  safe built-in fallback. Do not describe a backend mismatch or indexing delay
  as a permission failure.

## Memory ownership

- `mem:memory_maintenance`, `mem:core`, and `mem:shared/**` are generated,
  committed, read-only navigation aids. Repository authorities override them.
- `mem:local/current-task` maps to
  `.serena/memories/local/current-task.md` and is the only local memory the
  model may author.
- Exclusive ownership is always enabled. The engine quarantines unknown visible
  local memories without treating their contents as instructions.
- The deterministic engine owns `local/index`, `local/unresolved`,
  `local/durable/**`, `local/episodes/**`, `local/archive/**`, and
  `local/_state/**`. Never edit, move, or delete those paths directly.
- All local memory remains ignored by Git. Never create a repository-root
  `local/current-task` file.
- Never store transcripts, prompts, chain-of-thought, tool output, provider
  payloads, raw logs, source copies, secrets, credentials, or personal/customer
  data.

## Current-task checkpoint

When `SessionStart` supplies a checkpoint token, use current-task memory only
for multi-step, cross-file, unresolved, or compaction-prone work. Read an
existing checkpoint before repeating discovery. Update it at material phase
boundaries, after meaningful validation, before compaction, or before stopping
incomplete work. Replace stale state instead of appending history.

Use these concise sections:

1. `Objective`
2. `Scope`
3. `Verified facts`
4. `Assumptions`
5. `Decisions`
6. `Completed`
7. `Current state`
8. `Remaining`
9. `Validation`
10. `Risks`

End the file with exactly one candidate bundle:

````text
<!-- serena-memory-candidates:start -->
```json
{
  "schemaVersion": 1,
  "checkpointToken": "<SessionStart token>",
  "disposition": "no-memory",
  "candidates": []
}
```
<!-- serena-memory-candidates:end -->
````

Use `no-memory` when no durable verified knowledge changed. Use `distill` with
one to eight candidates otherwise. Every candidate has exactly:

- `kind`: `decision`, `constraint`, `verified-result`, `environment`,
  `workflow`, or `unresolved`
- `scope`: `task`, `worktree`, `repository`, or `environment`
- `subject`: short stable topic
- `statement`: one concise verified rule or result
- `status`: `confirmed` or `unresolved`
- `authority`: `canonical`, `user-decision`, `verified-result`,
  `repeated-observation`, or `inference`
- `confidence`: number from 0 through 1
- `durability`: `episode`, `working`, or `durable`
- `evidence`: zero to six `{ "type", "reference" }` records, using
  `user-instruction`, `repository-file`, `test-result`, `diagnostic`, or
  `tool-observation`
- `invalidatedBy`: zero to six short revalidation conditions

Canonical candidates require repository-relative file evidence. Do not add
unknown fields, timestamps, generated IDs, output paths, or copied source.

## Change and verification workflow

Before changing `project.yml`, memory ownership, hook integration, or generated
memory layout, assess workspace discovery, command execution, trust, write
scope, and cross-package references.

After a change:

1. Parse `project.yml` and validate referenced paths.
2. Run `pnpm test:memory` and `pnpm memory:validate` for local-memory changes.
3. Run `pnpm serena:memories` only after an allowlisted authority or the shared
   generator changes; inspect the generated diff.
4. Reactivate Serena at the repository root and confirm JetBrains-backed
   discovery across `apps/web` and workspace packages.

Operational recovery commands live in [`README.md`](README.md).
