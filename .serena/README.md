# Serena JetBrains operator guide

This repository uses the user-level official Serena MCP with the JetBrains
backend. It does not register another project-local Serena MCP, launcher,
watchdog, or proxy.

## Runtime chain

```text
Codex Desktop
  -> user-level official Serena MCP
  -> serena-agent installed with uv tool
  -> 127.0.0.1
  -> IntelliJ IDEA Serena JetBrains Plugin
```

Keep this repository open and indexed in IntelliJ IDEA before starting a
semantic task. The user-level registration is created with `serena setup
codex`; the project is initialized with `serena init -b JetBrains`.

## Project settings

- [`.serena/project.yml`](project.yml) is the portable project contract.
- `language_backend: JetBrains` selects IDE semantics; the language list stays
  empty because the language-server backend is not used.
- Onboarding and project-query tools stay disabled for this already configured
  repository.
- Project include, exclude, and fixed tool lists stay empty. Serena context and
  mode compatibility determine which optional tools are exposed at runtime.
- Do not commit user paths, installed versions, or fixed tool counts. Verify the
  active runtime with `serena --version` and `serena tools list --all`.

## Hooks

User-level official `serena-hooks` owns Serena lifecycle integration.
Project-local [`.codex/hooks.json`](../.codex/hooks.json) is only the repository
guard and must remain portable; do not add absolute user paths.

## Memory operations

Use the current Serena CLI commands when repository memory work is explicitly
needed:

```bash
serena memories list
serena memories read <name>
serena memories write <name>
serena memories edit <name>
serena memories check
```

Store only concise, durable, verified project facts. Keep temporary task state
in the task itself.

## Recovery

1. Check `serena --version`, `uv tool list`, and `codex mcp get serena`.
2. Confirm that IntelliJ IDEA has this exact repository root open and indexed.
3. Confirm that the Serena JetBrains Plugin is enabled and its loopback service
   is reachable.
4. Start a fresh MCP session and prove one narrow `jet_brains_*` semantic call.

A timeout or unavailable semantic call is a failed check. Diagnose the runtime
chain instead of treating a longer timeout as proof of health.

## Official references

- [Serena documentation](https://oraios.github.io/serena/)
- [Serena repository](https://github.com/oraios/serena)
- [Serena JetBrains Plugin](https://plugins.jetbrains.com/plugin/28356-serena)
