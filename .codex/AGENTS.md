# Project Codex Configuration Contract

This file governs `.codex/` and everything below it.

Artifact placement is defined once in the repository-root
[`AGENTS.md`](../AGENTS.md). Project configuration loads only when Codex trusts
the repository, so every active change here is behavioral and
security-sensitive.

## Canonical structure

```text
.codex/
├── AGENTS.md
├── README.md
├── config.toml                 # active trusted-project settings
├── agents/
│   ├── README.md
│   └── <agent-name>.toml       # registered focused custom agent
├── environments/
│   └── environment.toml        # Codex Desktop worktree setup and actions
├── instructions/
│   └── model-instructions.md   # project model-instruction override
├── hooks/
│   ├── AGENTS.md
│   ├── README.md
│   ├── repository-guard.mjs    # generated-file and architecture guard
│   └── memory-orchestrator.mjs # automatic Serena memory lifecycle
├── hooks.json                  # active reviewed hook registrations
└── rules/
    ├── README.md
    └── <rule-name>.rules       # optional; experimental command policy
```

The repository currently loads its project model instructions, registers five
focused custom agents, enables the reviewed repository guard and automatic
Serena memory lifecycle through `.codex/hooks.json`, and provides focused
validation and development command rules. Commands with source-control or
generated-file side effects remain approval-gated.

## `config.toml` rules

Project `.codex/config.toml` layers are repository settings, not personal
preferences. They load only for a trusted project and are merged from the
project root toward the current working directory; the nearest layer wins.

Rules:

1. Add a setting only for a documented shared repository requirement.
2. Do not copy an entire user `~/.codex/config.toml` into the repository.
3. Do not commit API keys, access tokens, OAuth state, credentials, telemetry
   endpoints containing secrets, or personal absolute paths.
4. Keep provider authentication, personal profiles, notifications, and user
   preferences in user configuration, not project configuration.
5. Resolve relative paths from the `.codex/` directory containing the config.
6. Prefer one hook representation per config layer: either sibling
   `hooks.json` or inline `[hooks]`, not both.
7. Treat model, reasoning, sandbox, network, MCP, and hook changes as behavioral
   changes requiring explicit review.
8. Do not weaken sandboxing or approval policy merely to make a command pass.
9. Keep `model_instructions_file` at the TOML top level before `[agents]`;
   otherwise TOML interprets it as an agent-role entry.

## Custom agent contract

Project custom agents live at `.codex/agents/<agent-name>.toml`. Do not create
one when a prompt, `AGENTS.md`, or skill is sufficient.

Every custom-agent TOML file requires:

```toml
name = "reviewer"
description = "Review changes for correctness, security, and missing tests."
developer_instructions = """
Review only the requested scope.
Prioritize behavior regressions, security, and verification gaps.
"""
```

Optional model, reasoning, sandbox, MCP, and skill overrides inherit from the
parent when omitted. Add overrides only when the role genuinely requires them.
Matching the filename to `name` is the repository convention.

## Hook contract

Hooks are lifecycle enforcement and can execute commands. They are not a place
for advisory prose—that belongs in `AGENTS.md`.

The active hook's local workflow and validation live in
[`hooks/AGENTS.md`](hooks/AGENTS.md). This section remains authoritative for
general hook safety.

Before adding a hook:

- Identify the exact lifecycle event and matcher.
- Prefer a deterministic repository script with bounded inputs.
- Use a repository-relative path.
- Define timeout and failure behavior.
- Treat all event payloads as untrusted input.
- Never print or persist secrets.
- Test on Windows and the CI target when both are supported.
- Obtain explicit review because a trusted project can load project hooks.

Do not create `hooks.json` until at least one reviewed hook exists. If
`hooks.json` is added, scripts belong under `.codex/hooks/` and the file must be
valid JSON.

## Rules contract

`.codex/rules/*.rules` controls command execution outside the sandbox. Rules
are experimental and require conservative review.

- Use exact, narrow command prefixes.
- Default to `prompt` for operations with side effects or external access.
- Include `justification`, `match`, and `not_match` examples.
- Never approve a broad interpreter, shell, destructive command, or credential
  command by prefix.
- Keep rules project-specific. Personal convenience rules belong in the user
  layer.
- Test rule behavior before relying on it.

## Change workflow

Before changing `.codex/`:

1. State which Codex behavior is changing and why it must be project-wide.
2. Confirm a prompt, `AGENTS.md`, or skill is not the smaller correct surface.
3. Verify the setting or schema against current official documentation.
4. Assess trust, permissions, secrets, portability, and CI impact.

After changing `.codex/`:

1. Parse TOML/JSON and validate all referenced paths.
2. Start a fresh Codex session because configuration is discovered at startup.
3. Verify the intended setting loads in a trusted checkout.
4. Verify an untrusted checkout does not rely on project configuration.
5. Confirm no credentials or user-specific state are tracked.

## Definition of done

- The smallest correct customization surface was used.
- Project configuration is valid, portable, and safe for all contributors.
- Active agents, hooks, or rules have focused names and documented behavior.
- Security-sensitive changes received explicit review.
- No personal or secret state is present.

## Official documentation basis

- <https://developers.openai.com/codex/codex-manual.md>
- <https://learn.chatgpt.com/docs/config-file/config-basic>
- <https://learn.chatgpt.com/docs/agent-configuration/subagents>
- <https://learn.chatgpt.com/docs/hooks>
- <https://learn.chatgpt.com/docs/agent-configuration/rules>
