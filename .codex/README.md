# Support Codex configuration

This directory contains the smallest shared Codex Desktop configuration needed
by this repository:

- [`config.toml`](config.toml) registers project-specific agents, Context7, and
  Mermaid Chart.
- [`agents/`](agents/) defines project-specific requirements, review, and
  verification agents. Codex built-ins still own general exploration and
  implementation.
- [`rules/validation.rules`](rules/validation.rules) allows only the canonical
  repository validation scripts to run outside the sandbox.
- [`environments/environment.toml`](environments/environment.toml) checks a new
  worktree and exposes dependency installation as an explicit action.
- [`hooks.json`](hooks.json) and [`hooks/`](hooks/) enforce generated-file and
  architecture policy.

Repository guidance stays in the applicable `AGENTS.md` chain. There is no
project base-model override: `model_instructions_file` replaces Codex's base
instructions and is not the correct surface for repository conventions.

Project command rules load only for trusted checkouts. They allow the canonical
`pnpm` validation scripts and do not allow dependency installation, development
servers, end-to-end tests, arbitrary package execution, Git writes, deployment,
or publication outside the sandbox. The rules feature remains experimental, so
keep its allowlist narrow and test every change with `codex execpolicy check`.

Follow [`AGENTS.md`](AGENTS.md) before changing this directory. Validate TOML,
JSON, references, and `pnpm test:hooks`, then start a fresh trusted Codex
Desktop task because project configuration is discovered at startup. Serena
MCP and lifecycle hooks are user-level official integrations, not duplicated
in this project directory.
