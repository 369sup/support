# Support Repository Guidance

This repository is a Next.js implementation of a GitHub-like non-code product
platform. It models users, enterprises, organizations, teams, repositories,
collaboration, notifications, governance, commerce, and integrations while
excluding Git, repository content, pull requests, code review, and Actions.
Keep changes easy to trace and safe around authentication, authorization,
tenant isolation, invitations, notifications, billing, and personal data.

## Instruction resolution

This file owns repository-wide workflow only. A nested `AGENTS.md` adds rules
for its subtree; anything it does not mention remains inherited. When
repository instructions differ, the file closest to the target wins.

- Give every rule one authoritative definition. Nested files link to that
  definition and contain only local responsibilities, workflow, validation, or
  explicit differences.
- Add a nested file only for a real ownership, dependency, terminology,
  workflow, validation, or exception boundary.
- Do not add empty instruction files or permanent `AGENTS.override.md` files.
- Keep task-only requirements in the task prompt, not repository instructions.

Official discovery and precedence behavior is documented at
<https://learn.chatgpt.com/docs/agent-configuration/agents-md>.

## Authority map

| Concern | Authoritative location |
| --- | --- |
| Architecture rules, naming, module shape, TypeScript clarity, context catalog, and exceptions | [`docs/architecture/AGENTS.md`](docs/architecture/AGENTS.md) |
| Deployable application policy | [`apps/AGENTS.md`](apps/AGENTS.md) |
| Next.js application package workflow | [`apps/web/AGENTS.md`](apps/web/AGENTS.md) |
| App Router delivery workflow | [`apps/web/src/app/AGENTS.md`](apps/web/src/app/AGENTS.md) |
| Bounded-context development workflow | [`apps/web/src/modules/AGENTS.md`](apps/web/src/modules/AGENTS.md) |
| Workspace package policy | [`packages/AGENTS.md`](packages/AGENTS.md) |
| Documentation workflow | [`docs/AGENTS.md`](docs/AGENTS.md) |
| Shared repository scripts | [`scripts/AGENTS.md`](scripts/AGENTS.md) |

Agent and automation assets use this single placement map:

| Artifact | Owner |
| --- | --- |
| Repository skills and plugin marketplace catalog | [`.agents/AGENTS.md`](.agents/AGENTS.md) |
| Trusted-project Codex config, custom agents, hooks, and command rules | [`.codex/AGENTS.md`](.codex/AGENTS.md) |
| GitHub workflows, templates, and Codex Action prompts | [`.github/AGENTS.md`](.github/AGENTS.md) |
| Installable plugin package source | [`plugins/AGENTS.md`](plugins/AGENTS.md) |
| Serena project integration | [`.serena/AGENTS.md`](.serena/AGENTS.md) |

Do not invent product rules. When tenant boundaries, roles, repository scopes,
token lifetime, notification behavior, or data ownership are unclear, surface
the ambiguity before encoding behavior.

## Cross-platform automation

Shared repository automation must run on Windows, macOS, and Linux. Use Node.js
or package-manager scripts. Add platform-specific scripts only when explicitly
requested and document their scope.

## Context-efficient workflow

- Start from the target path, read its nearest `AGENTS.md`, then follow only the
  authorities it names.
- Prefer exact symbol and reference lookup through Serena when available. Use
  `rg` or `rg --files` for direct text and path discovery.
- Use Repomix only for repository-wide snapshots, architecture mapping, and
  cross-file pattern discovery. Do not use it instead of Serena for a known
  symbol or instead of direct tools for a known file.
- Read focused symbols or sections before whole large files. Ignore generated
  output, dependencies, and unrelated modules.
- Make the smallest in-scope change and inspect the actual diff.
- Run focused validation first, then the repository-wide gate required by risk.

## Verification

Canonical repository commands are:

```text
pnpm typecheck
pnpm lint
pnpm architecture
pnpm test
pnpm build
pnpm check
```

After a TypeScript change, run `pnpm check` when practical. Report every check
that did not run instead of implying full validation.

## Review guidelines

Prioritize correctness, authentication and authorization, tenant isolation,
PII and secret exposure, repository access and role semantics, input validation,
Server/Client boundaries, destructive data changes, and missing verification.
Report actionable findings with priority, file and line, failure scenario,
impact, and the smallest safe correction. Avoid style-only findings already
enforced mechanically.
