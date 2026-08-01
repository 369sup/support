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

- Give every rule one authoritative definition. Nested files may translate that
  definition into a concise subtree-local checklist, but they must link to the
  authority and must not create a competing meaning or broader exception.
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
| Deployable runtime boundaries, composition, process state, and background work | [`apps/AGENTS.md`](apps/AGENTS.md) |
| Next.js package configuration, environment, instrumentation, build, and release | [`apps/web/AGENTS.md`](apps/web/AGENTS.md) |
| Web source placement, TypeScript, React, interaction, async, and source-test baseline | [`apps/web/src/AGENTS.md`](apps/web/src/AGENTS.md) |
| App Router files, transport boundaries, caching, navigation, metadata, and route states | [`apps/web/src/app/AGENTS.md`](apps/web/src/app/AGENTS.md) |
| Domain modeling, use cases, Ports and Adapters, persistence, events, authorization, and tenant safety | [`apps/web/src/modules/AGENTS.md`](apps/web/src/modules/AGENTS.md) |
| Workspace package policy | [`packages/AGENTS.md`](packages/AGENTS.md) |
| Framework-neutral wire schemas | [`packages/contracts/AGENTS.md`](packages/contracts/AGENTS.md) |
| Lint and TypeScript mechanical enforcement | [`packages/eslint-config/AGENTS.md`](packages/eslint-config/AGENTS.md), [`packages/typescript-config/AGENTS.md`](packages/typescript-config/AGENTS.md), and [`packages/tooling/AGENTS.md`](packages/tooling/AGENTS.md) |
| Reusable UI and accessibility workflow | [`packages/shadcn/AGENTS.md`](packages/shadcn/AGENTS.md) |
| Logging, tracing, metrics, and redaction | [`packages/observability/AGENTS.md`](packages/observability/AGENTS.md) |
| Shared test-runner configuration | [`packages/testing-config/AGENTS.md`](packages/testing-config/AGENTS.md) |
| Documentation workflow | [`docs/AGENTS.md`](docs/AGENTS.md) |
| Shared repository scripts | [`scripts/AGENTS.md`](scripts/AGENTS.md) |

## Workspace ownership

- [`apps/`](apps/AGENTS.md) contains deployable applications and their
  application-owned runtime composition. Each application keeps framework
  delivery separate from product bounded contexts according to its nearest
  instructions.
- [`packages/`](packages/AGENTS.md) contains reusable, business-free technical
  capabilities and configuration contracts. Product bounded contexts,
  authorization policy, tenant rules, and application-specific composition do
  not move into workspace packages.
- Dependencies point from applications to packages. A package never imports an
  application or becomes an alternate home for product domain behavior.

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

## Repository-wide engineering baseline

- Keep every change local, explicit, and traceable. Do not combine a feature or
  fix with unrelated refactoring, formatting, dependency upgrades, or
  speculative architecture.
- Give each rule, configuration value, public contract, and data shape one
  owner. Reuse that authority instead of copying it into a second source of
  truth.
- Prefer the simplest implementation that preserves the required boundary.
  Add an abstraction, factory, strategy, extension point, or shared module only
  after multiple real consumers demonstrate the same semantics, change reason,
  and lifecycle.
- Prefer composition and small explicit functions over inheritance. Use a
  class only when it protects state, invariants, or genuine polymorphic
  behavior.
- Keep public APIs minimal. Before changing or deleting one, identify every
  consumer, dynamic load path, compatibility obligation, and migration need.
  Breaking contracts require an explicit version or migration decision.
- Add a dependency only when platform capabilities and existing dependencies
  cannot reasonably satisfy the need. Confirm its owner, purpose, maintenance,
  security posture, bundle or runtime cost, and lockfile effect; do not add
  overlapping providers.
- Await, return, compose, or deliberately track every Promise. Bound
  concurrency over collections; do not start unbounded database or network
  work, and do not let background work depend on an HTTP request remaining
  alive.
- Keep configuration as data with one source of truth. Environment differences
  must not fork business code. Every feature flag has an owner, purpose, removal
  condition, and a bounded lifetime.
- Comments explain a non-obvious reason, constraint, invariant, or tradeoff.
  Delete dead code instead of commenting it out. A TODO must include a
  traceable owner or work item and the reason it cannot be completed now.
- Tests assert behavior and contracts rather than private implementation.
  Every bug fix adds a regression that fails before the fix; every important
  invariant and failure branch has a proportionate test.

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
