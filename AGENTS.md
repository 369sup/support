# Support Repository Guidance

This file defines repository-wide invariants. Nested `AGENTS.md` files add only
subtree deltas and inherit everything else.

## Context loading

1. Read this file, then only the `AGENTS.md` files on the target path.
2. Read a `README.md` only when its behavior, design, or operations are needed.

Do not speculatively load sibling guidance, generated output, dependencies,
caches, or vendor docs. Root `README.md` is optional product/runtime context.

## Authorities

- [`docs/architecture/architecture.md`](docs/architecture/architecture.md) owns
  architecture semantics; [`docs/architecture/AGENTS.md`](docs/architecture/AGENTS.md)
  owns their change workflow.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) owns change and Git workflow.
- [`apps/AGENTS.md`](apps/AGENTS.md) owns deployable runtime composition.
- [`apps/web/AGENTS.md`](apps/web/AGENTS.md) owns Next.js configuration,
  environment, build, and release.
- [`apps/web/src/AGENTS.md`](apps/web/src/AGENTS.md) owns source placement;
  `app` delivery and `modules` product behavior remain separate.
- [`packages/AGENTS.md`](packages/AGENTS.md) owns business-free workspace packages.
- `.codex`, `.github`, `.serena`, `docs`, and `scripts` use their nearest
  `AGENTS.md`.

## Invariants

- Support models GitHub-like non-code product capabilities. Git content,
  commits, diffs, pull requests, code review, and Actions remain excluded.
- Before adding, changing, or reviewing GitHub-like product behavior, use the
  [integrated GitHub non-code semantic model](docs/README.md)
  and trace requirements through evidence, relationships, lifecycle,
  authorization, and interactions. Load architecture/navigation only for
  placement or presentation.
- The atlas is research, not a schema, API, route, test, activation, or
  architecture contract. Preserve `Confirmed`, `Derived`, and `Unresolved`;
  map distinct concerns explicitly instead of replacing either authority.
- Applications may depend on packages; packages never depend on applications
  or own product authorization, tenant, billing, notification, or data rules.
- Routes import bounded-context public entrypoints, never module internals.
- Do not invent authentication, authorization, tenant, invitation, retention,
  billing, notification, or personal-data behavior when the catalog and source
  do not define it.
- Keep changes local, dependency-light, reversible, and separate from cleanup.
  Preserve user work and inspect Git state before mutation.

## Tool workflow

- Use Serena JetBrains first for semantic navigation, inspection, debugging,
  and reference-sensitive refactors.
- Use direct file tools for non-symbolic content and shell for builds, tests,
  Git, and system diagnostics. Fall back only after checking the project root,
  connection, and indexing; retry once with narrower scope and report the gap.
- Activate Serena and read its instructions before material work. Store only
  concise, durable, verified facts in official Serena memory; keep task state
  in the task unless a checkpoint is required.
- Use Repomix only for narrow snapshots or cross-file patterns. Start with
  `includePatterns`, inspect metrics, keep security scanning enabled, distrust
  remote config, and disclose intentional compression loss.
- Confirm versions and prefer matching official documentation.

## Subagent workflow

- Delegate only independent, read-heavy parts of complex work; use at most three
  subagents. Use `explorer` for source questions and `reviewer` for change review.
- Use `worker` only for explicitly requested parallel implementation, with
  disjoint ownership and preservation of unrelated changes.
- Do not delegate simple, sequential, same-file, or independently unverifiable
  work. Descendants require explicit user approval.
- The primary agent owns scope, synthesis, conflicts, diff review, verification,
  and the final response.

## Verification

Run the narrowest discriminating check first, then expand according to risk.
Canonical commands are `pnpm typecheck`, `pnpm lint`, `pnpm architecture`,
`pnpm test`, `pnpm build`, and `pnpm check`. On Windows, use `pnpm.cmd` when
PowerShell blocks the shim.

After changes, inspect diagnostics, references, generated outputs, the actual
diff, `git diff --check`, and untracked files. Report checks that did not run;
never treat an unavailable or timed-out check as passing.
