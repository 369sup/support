# Repository Hook Workflow

This file governs `.codex/hooks/**` and adds only the active hooks' local
workflow. The parent [`AGENTS.md`](../AGENTS.md) owns general hook security.
[`README.md`](README.md) is authoritative for current behavior and focused
test commands; do not restate them here.

When the event contract or guarded scope changes, update `hooks.json`, the
launcher, implementation, tests, and README together. Preserve the parent hook
security contract. Serena lifecycle hooks remain in the official user-level
configuration and are not implemented here.

## Validation

Run `pnpm test:hooks`, parse `.codex/hooks.json`, and run affected architecture
checks. Restart Codex and review the hook hash with `/hooks` before trusting it.
