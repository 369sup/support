# Codex Project Configuration

Scope: `.codex/**`. Repository conventions remain in
[`../AGENTS.md`](../AGENTS.md); this file owns only Codex configuration that
loads for a trusted checkout.

## Active surfaces

- [`config.toml`](config.toml) registers one project-specific review agent,
  Context7, and Mermaid Chart.
- [`agents/reviewer.toml`](agents/reviewer.toml) adds Support-specific review
  priorities. Codex built-ins cover general exploration and implementation.
- [`environments/environment.toml`](environments/environment.toml) defines the
  Codex Desktop worktree setup check and dependency-install action.
- [`hooks.json`](hooks.json) registers only the repository guard described
  under [`hooks/`](hooks/). Serena activation, reminders, and cleanup use the
  official user-level `serena-hooks` lifecycle.

Do not add a customization surface until a current, project-wide requirement
needs it. Durable repository guidance belongs in `AGENTS.md`; repeated
task-specific workflows belong in a skill; personal preferences and
credentials belong in user configuration.

## Configuration invariants

- Verify every setting against current official Codex documentation.
- Keep project configuration portable and secret-free. Never commit API keys,
  tokens, OAuth state, telemetry credentials, or personal absolute paths.
- Do not use `model_instructions_file` to restate repository guidance: it
  replaces Codex base instructions, while `AGENTS.md` is the supported
  repository-guidance surface.
- Do not set project-wide model, reasoning, approval, sandbox, or agent-network
  defaults without a demonstrated shared requirement and security review.
- Use one hook representation per config layer. This repository uses
  [`hooks.json`](hooks.json), not inline `[hooks]`.
- Context7 uses `https://mcp.context7.com/mcp`. Its optional
  `CONTEXT7_API_KEY` value comes from the contributor's environment through
  `env_http_headers`; never replace it with a literal secret.

## Custom agent boundary

Keep a custom agent only when its project-specific role is narrower than a
built-in agent or a one-off prompt. Every agent file requires `name`,
`description`, and `developer_instructions`; matching filename and name is the
repository convention. Omit model and reasoning overrides unless evidence
shows the role needs them.

The current reviewer is read-only and reports actionable correctness,
security, architecture, regression, and verification risks. It must not edit,
commit, push, or expand the delegated scope.

## Hook boundary

Hooks execute commands in trusted checkouts. They must use bounded
repository-relative inputs, explicit timeouts, untrusted-event validation, and
fail-safe behavior. They must never persist transcripts, prompts, tool output,
provider payloads, secrets, credentials, or personal/customer data.

The local repository-guard workflow and tests live in
[`hooks/AGENTS.md`](hooks/AGENTS.md). Do not add a second Serena lifecycle or
memory engine here; official Serena owns those concerns.

## Change and verification workflow

Before changing `.codex/**`, identify the behavior, why it must be shared, and
why a prompt, `AGENTS.md`, built-in agent, or skill is insufficient. Review
trust, permissions, network, portability, secret handling, and startup impact.

After a change:

1. Parse TOML and JSON and resolve every referenced path.
2. Run `pnpm test:hooks` when hook definitions or implementations changed.
3. Inspect the actual diff and confirm no personal or secret state is tracked.
4. Start a fresh trusted Codex Desktop task and verify configuration discovery.
5. Report any setting that could not be verified in the running client.

Official references:

- <https://developers.openai.com/codex/codex-manual.md>
- <https://learn.chatgpt.com/docs/config-file/config-basic>
- <https://learn.chatgpt.com/docs/agent-configuration/subagents>
- <https://learn.chatgpt.com/docs/hooks>
