# Serena Memory Operator Guide

This guide explains operation and recovery. It is not policy authority;
[`AGENTS.md`](AGENTS.md) and the tracked memory engine define the repository
contract.

## Memory layers

- `core`, `memory_maintenance`, and `shared/**` are committed, deterministic,
  reviewed, and read-only.
- `local/current-task` is the only local memory the model may author.
- `local/index`, `local/unresolved`, and `local/durable/**` are rendered by
  `scripts/memory/**`.
- `local/episodes/**`, `local/archive/**`, and `local/_state/**` are hidden
  machine state and are ignored by Git and Serena memory tools.

Do not hand-edit rendered memories, the manifest, ownership metadata, episodes,
or archives.

## Lifecycle

1. `SessionStart` creates a checkpoint token.
2. The agent maintains the bounded task handoff and candidate bundle in
   `local/current-task`.
3. `PreCompact` checkpoints valid candidates without blocking compaction on
   invalid input.
4. `Stop` requests at most one repair continuation, then fails open.
5. The engine validates, deduplicates, resolves authority conflicts, applies
   TTL, archives expired entries, and renders visible local memories.
6. Serena activation performs only bounded deterministic maintenance. It never
   calls an LLM or scans repository source.

## Legacy migration

Preview the exact unmanaged visible inventory without writing local state:

```text
pnpm memory:migrate
```

The preview returns an inventory hash and checkpoint token. Put that exact token
in a valid candidate bundle in `local/current-task`, then apply:

```text
pnpm memory:migrate -- --apply
```

Apply refuses inventory drift or an invalid candidate bundle. It distills valid
candidates, validates every source hash, and writes content-free tombstones to
`local/_state/migrations/<migration-id>.json`. Only after those checks does it
permanently remove the retired legacy Markdown and set
`local/_state/ownership.json` to `exclusive`. Existing content-preserving
legacy archives are upgraded and purged idempotently on apply or activation.

## Exclusive ownership and quarantine

In exclusive mode, the only visible local memories are:

- `local/current-task`
- `local/index`
- `local/unresolved`
- `local/durable/**`

Activation automatically quarantines any other visible local memory. The
original content, SHA-256, name, reason, and archive metadata remain under
`local/archive/quarantine/**`. `local/unresolved` exposes only bounded metadata,
never the archived content. Normal repository work remains fail-open.

## Operations

```text
pnpm memory:activate
pnpm memory:checkpoint
pnpm memory:distill
pnpm memory:maintain
pnpm memory:status
pnpm memory:validate
pnpm memory:migrate
pnpm test:memory
```

Use `pnpm serena:memories` only when an authoritative shared-memory input or the
deterministic generator changes. Inspect the generated diff and run the
configured architecture checks.

## Recovery

- If migration preview and apply tokens differ, do not move files manually.
  Re-run preview and update the current-task bundle.
- If apply stops before exclusive ownership is enabled, fix the reported
  validation or filesystem error and re-run apply; the applying state and
  tombstone metadata make recovery idempotent.
- If `memory:validate` reports tombstone or quarantine archive drift, preserve
  the remaining evidence and investigate. Do not rewrite hashes to silence the
  error.
- Inspect legacy tombstones under `local/_state/migrations/**` and quarantine
  evidence under `local/archive/quarantine/**` through raw filesystem paths.
  Do not change ignored patterns merely to expose them in Serena.
