# Project hook scripts

The sibling `.codex/hooks.json` runs `repository-guard.mjs` before and after
Codex file edits.

The guard:

- blocks direct edits to the generated `docs/architecture/module-map.md`;
- runs the existing architecture checker after relevant TypeScript, module-map,
  exception-registry, or architecture-checker edits;
- reports actionable feedback without rewriting repository files; and
- bounds and validates the JSON event received on standard input.

The command launcher resolves the repository root with `git`, then starts the
hook with Node.js. It does not interpolate event data into a shell command.

Run the focused tests with:

```text
node --test .codex/hooks/repository-guard.test.mjs
```

After changing a hook definition or script, restart Codex and review its new
hash with `/hooks` before trusting it. Follow [AGENTS.md](AGENTS.md), which
inherits the parent project-configuration contract.
