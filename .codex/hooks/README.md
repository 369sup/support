# Project hook scripts

The sibling `.codex/hooks.json` runs the reviewed repository guard.

## Repository guard

`repository-guard.mjs` runs before and after Codex file edits. It:

- blocks direct edits to the generated `docs/architecture/module-map.md`;
- runs the existing architecture checker after relevant TypeScript, module-map,
  exception-registry, or architecture-automation edits;
- reports actionable feedback without rewriting repository files; and
- bounds and validates the JSON event received on standard input.

The command launcher resolves the repository root with `git`, then starts the
hook with Node.js. It does not interpolate event data into a shell command.

Run all focused tests with:

```text
pnpm test:hooks
```

After changing a hook definition or script, restart Codex and review its new
hash with `/hooks` before trusting it. Follow [AGENTS.md](AGENTS.md), which
inherits the parent project-configuration contract. Official user-level
`serena-hooks` own Serena activation, reminders, and cleanup.
