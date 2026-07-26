# Project hook scripts

The sibling `.codex/hooks.json` runs the reviewed repository guard and
automatic Serena memory lifecycle.

## Repository guard

`repository-guard.mjs` runs before and after Codex file edits. It:

- blocks direct edits to the generated `docs/architecture/module-map.md`;
- runs the existing architecture checker after relevant TypeScript, module-map,
  exception-registry, or architecture-automation edits;
- reports actionable feedback without rewriting repository files; and
- bounds and validates the JSON event received on standard input.

The command launcher resolves the repository root with `git`, then starts the
hook with Node.js. It does not interpolate event data into a shell command.

## Automatic Serena memory

`memory-orchestrator.mjs` integrates `SessionStart`, Bash reminders,
`PostToolUse`, `PreCompact`, and `Stop` with the deterministic engine under
`scripts/memory/`.

It injects a checkpoint token, records only a dirty/hash checkpoint state,
validates the
model-authored candidate bundle in `local/current-task`, and performs
checkpoint, distillation, conflict handling, TTL, archive, and rendering. It
never reads `transcript_path` or persists prompts, tool output, logs, provider
payloads, secrets, or credentials. A missing `serena-hooks` executable produces
a warning without blocking normal repository work.

`Stop` requests at most one continuation to repair a missing or stale
checkpoint. A second failure is reported and allowed to stop so the hook cannot
loop indefinitely.

Exclusive ownership is always enabled. Activation quarantines any unknown
visible local memory. The original content and SHA-256
remain in the hidden archive; `local/unresolved` receives only the memory name,
hash, archive reference, and reason.

Run all focused tests with:

```text
pnpm test:memory
```

After changing a hook definition or script, restart Codex and review its new
hash with `/hooks` before trusting it. Follow [AGENTS.md](AGENTS.md), which
inherits the parent project-configuration contract.
