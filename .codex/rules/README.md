# Project command rules

Optional experimental command-policy files live here as `<rule-name>.rules`.

`workspace-validation.rules` allows only the repository's canonical `pnpm`
validation scripts to run outside the sandbox without repeated approval.
`workspace-development.rules` adds the focused package checks verified in this
workspace and records the approved spelling of architecture generation and Git
publication commands. Commands that update tracked files, Git state, or a
remote remain `prompt`; they are not silently allowed.

On Windows, use `pnpm.cmd` for the focused commands so PowerShell does not
select the `pnpm.ps1` shim:

```text
pnpm.cmd --filter @support/web build
pnpm.cmd --filter @support/web lint
pnpm.cmd --filter @support/web test
pnpm.cmd --filter @support/web typecheck
pnpm.cmd --filter @support/shadcn lint
pnpm.cmd --filter @support/shadcn typecheck
pnpm.cmd test:architecture
pnpm.cmd architecture:docs
pnpm.cmd serena:memories
```

The known-good main publication sequence is:

```text
git fetch origin main
git add -A
git commit -m "<message>"
git push origin main
```

These Git commands intentionally prompt because they change local or remote
repository state. `test:e2e` and `check:full` are not allowlisted while the
Playwright teardown timeout remains unresolved.

Validate a command against both project rule files before changing policy:

```text
codex execpolicy check --pretty \
  --rules .codex/rules/workspace-validation.rules \
  --rules .codex/rules/workspace-development.rules \
  -- <command> <arguments>
```

Restart Codex after changing a `.rules` file because project rules are loaded
when a trusted project configuration starts.

Add only narrow reviewed prefixes with justification plus positive and
negative matching examples. Follow [../AGENTS.md](../AGENTS.md).
