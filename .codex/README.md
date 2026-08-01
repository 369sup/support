# Support Codex configuration

This directory contains trusted-project Codex behavior for the Support
pnpm/Turborepo workspace. It is repository configuration, not a reusable
configuration pack.

## Active project behavior

- [`config.toml`](config.toml) loads the repository model instructions,
  registers the five focused custom agents, enables the reviewed hook, and
  exposes the public Context7 MCP endpoint.
- [`instructions/model-instructions.md`](instructions/model-instructions.md)
  defines the project-wide execution baseline.
- [`agents/`](agents/) contains exploration, implementation, review,
  verification, and documentation-research roles.
- [`environments/environment.toml`](environments/environment.toml) defines the
  Codex Desktop worktree setup and the canonical pnpm actions.
- [`hooks.json`](hooks.json) and [`hooks/`](hooks/) provide the reviewed
  repository guard and automatic Serena task-memory lifecycle.
- [`rules/`](rules/) contains narrow command policies for repository workflows.

## Important TOML rule

`model_instructions_file` is a top-level setting and must appear before the
first table header. If it is placed after `[agents]`, TOML treats it as
`agents.model_instructions_file`; Codex then expects an agent-role table and
rejects the string value.

Agent registrations are tables whose `config_file` paths resolve from this
directory:

```toml
[agents]
enabled = true
max_concurrent_threads_per_session = 5

[agents.reviewer]
config_file = "agents/reviewer.toml"
description = "Review completed changes for actionable correctness, security, regression, and test risks."
```

## Maintenance

Follow [`AGENTS.md`](AGENTS.md) before changing this directory. Validate TOML
and JSON, verify every referenced path, and start a fresh trusted Codex task
after configuration changes because project configuration is loaded at startup.
