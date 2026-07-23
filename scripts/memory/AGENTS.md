# Serena Memory Engine Workflow

This file governs `scripts/memory/**`. The parent
[`AGENTS.md`](../AGENTS.md) owns the repository script contract.

## Trust boundary

- Treat candidate bundles, hook events, episode files, manifests, and existing
  local files as untrusted input.
- Reject unknown schema fields, oversized content, path escape, symlinks,
  malformed JSON/JSONL, sensitive values, raw logs, payloads, and source
  excerpts before persistence or rendering.
- Resolve every managed path from the repository root and keep all writes
  inside `.serena/memories/local/**`.
- Use atomic writes and the bounded managed lock for multi-file operations. A
  corrupt manifest must fail without being replaced.

## Ownership

- The model owns only `local/current-task`.
- The engine owns `local/index`, `local/unresolved`, `local/durable/**`,
  `local/episodes/**`, `local/archive/**`, and `local/_state/**`.
- Do not read or modify unrelated local memories.
- Do not import the shared-memory generator into the local engine or treat a
  local observation as canonical repository authority.

## Validation

Run:

```text
pnpm test:memory
pnpm memory:validate
pnpm governance:generated
```

Tests use temporary repositories and must not depend on or mutate the
developer's actual local memories.
