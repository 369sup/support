# Support Codex configuration

This directory contains the smallest shared Codex Desktop configuration needed
by this repository:

- [`config.toml`](config.toml) registers the Support reviewer, Context7, and
  Mermaid Chart.
- [`agents/reviewer.toml`](agents/reviewer.toml) defines the only
  project-specific custom agent.
- [`environments/environment.toml`](environments/environment.toml) checks a new
  worktree and exposes dependency installation as an explicit action.
- [`hooks.json`](hooks.json) and [`hooks/`](hooks/) enforce generated-file and
  architecture policy.

Repository guidance stays in the applicable `AGENTS.md` chain. There is no
project base-model override: `model_instructions_file` replaces Codex's base
instructions and is not the correct surface for repository conventions.

There are also no project command rules. Validation commands run inside the
selected sandbox; the repository does not pre-authorize them to execute
outside it.

Follow [`AGENTS.md`](AGENTS.md) before changing this directory. Validate TOML,
JSON, references, and `pnpm test:hooks`, then start a fresh trusted Codex
Desktop task because project configuration is discovered at startup. Serena
MCP and lifecycle hooks are user-level official integrations, not duplicated
in this project directory.
