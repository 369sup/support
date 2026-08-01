# Repository Guard Hook Workflow

This file governs `.codex/hooks/**` and adds only the active hook's local
workflow. The parent [`AGENTS.md`](../AGENTS.md) owns general hook security.
[`README.md`](README.md) is authoritative for the guard's current behavior and
focused test command; do not restate them here.

When the event contract or guarded scope changes, update `hooks.json`, the
launcher, implementation, tests, and README together. Preserve the parent hook
security contract.

## Validation

Run `node --test .codex/hooks/repository-guard.test.mjs`, parse
`.codex/hooks.json`, and run affected architecture checks. Restart Codex and
review the hook hash with `/hooks` before trusting it.
