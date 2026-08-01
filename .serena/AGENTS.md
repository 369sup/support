# Serena Project Workflow

Scope: `.serena/**`. Source-code workflow remains in the applicable repository
and source-tree `AGENTS.md` files. This file owns only Serena project
configuration and repository-local memory hygiene.

## Runtime authority

- Use the official global Serena MCP installed with `uv tool` and configured by
  `serena setup codex`.
- Use the official Serena JetBrains Plugin as the semantic backend. Do not add
  repository launchers, watchdogs, port proxies, duplicate MCP registrations,
  or a personal Codex Serena plugin.
- Keep `jetbrains_launch_command` empty. Serena must connect to an already open,
  indexed project through `127.0.0.1`; background operation must not open an IDE
  window.
- Keep project settings portable and secret-free. Never commit user install
  paths, IDE state, generated indexes, credentials, or customer data.

## Tool selection

- The user-level `included_optional_tools` contains every optional tool exposed
  by the installed Serena version, including all JetBrains BETA tools.
- Use JetBrains symbol, reference, hierarchy, inspection, debug, and refactoring
  tools first for source code.
- Use Serena Language Server tools only when the JetBrains backend cannot answer
  the semantic question. Use direct file tools for Markdown, JSON, YAML, TOML,
  and exact literal edits; use the shell for builds, tests, Git, and system
  diagnostics.
- Do not force an optional tool into the active set when the official `codex`
  context, `editing` mode, or JetBrains backend excludes it. Context and mode
  compatibility is authoritative; a larger raw tool count is not a correctness
  goal.
- When a tool fails, verify project root, IDE process, plugin loopback, and
  indexing state, then retry once with narrower input. Do not repeat an
  unchanged timeout or increase the timeout to hide a backend failure.

## Memory

- Use official Serena memory tools directly: `serena memories list`, `read`,
  `write`, `edit`, `delete`, and `check`.
- Store only durable verified project facts, decisions, constraints, or
  unresolved work that helps later tasks.
- Never store transcripts, prompts, chain-of-thought, raw tool output, logs,
  source copies, payloads, secrets, credentials, or personal/customer data.
- Local task memory under `.serena/memories/local/` remains ignored by Git.
  Delete or replace stale and contradictory entries instead of layering a
  second generated memory system over Serena.
- Repository files and current diagnostics override memory.

## Change and verification workflow

After changing Serena configuration:

1. Parse `project.yml` and the user-level Serena YAML.
2. Run `serena tools list --all` and compare the installed optional set.
3. Start a fresh official MCP using the `codex` context and activate this exact
   repository root.
4. Prove at least one real `jet_brains_*` call against the open indexed project.
5. Start a fresh trusted Codex Desktop task to verify configuration discovery.

Operational recovery details live in [`README.md`](README.md).
