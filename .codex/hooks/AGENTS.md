# Repository Hook Workflow

This file governs `.codex/hooks/**` and adds only the active hooks' local
workflow. The parent [`AGENTS.md`](../AGENTS.md) owns general hook security.
[`README.md`](README.md) is authoritative for current behavior and focused
test commands; do not restate them here.

When the event contract or guarded scope changes, update `hooks.json`, the
launcher, implementation, tests, and README together. Memory hooks must never
persist transcript content, prompts, tool output, provider payloads, secrets,
or credentials. Preserve the parent hook security contract.

## Validation

Run `pnpm test:memory`, parse `.codex/hooks.json`, and run affected
architecture checks. Restart Codex and review the hook hash with `/hooks`
before trusting it.
