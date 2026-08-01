# Support Repository Guidance

This file defines repository-wide invariants. A nested `AGENTS.md` adds only
the delta for its subtree; anything it does not change remains inherited.

## Context loading

1. Read this file.
2. Read only the `AGENTS.md` files on the path to the target.
3. Read a `README.md` only when the task needs its behavior, design, or
   operating details.

Do not load sibling guidance, generated output, dependencies, caches, or vendor
documentation speculatively. Root `README.md` is product and runtime context,
not a mandatory startup file.

## Authorities

- [`docs/architecture/architecture.md`](docs/architecture/architecture.md)
  owns architecture semantics; [`docs/architecture/AGENTS.md`](docs/architecture/AGENTS.md)
  owns their change workflow.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) owns change, review, commit, and merge
  workflow.
- [`apps/AGENTS.md`](apps/AGENTS.md) owns deployable runtime composition.
- [`apps/web/AGENTS.md`](apps/web/AGENTS.md) owns Next.js package configuration,
  environment, build, and release.
- [`apps/web/src/AGENTS.md`](apps/web/src/AGENTS.md) owns source placement;
  `app` delivery and `modules` product behavior remain separate.
- [`packages/AGENTS.md`](packages/AGENTS.md) owns reusable, business-free
  workspace packages.
- `.codex`, `.github`, `.serena`, `docs`, and `scripts` are governed by their
  own nearest `AGENTS.md`.

## Invariants

- Support models GitHub-like non-code product capabilities. Git content,
  commits, diffs, pull requests, code review, and Actions remain excluded.
- For work that adds, changes, or reviews GitHub-like product behavior, use the
  [GitHub non-code product-semantics atlas](docs/product-semantics/github-non-code/README.md)
  first. Follow the affected requirement through its GitHub Docs evidence,
  domain relationships, lifecycle, authorization, and interaction sequence;
  load architecture or navigation only for placement or presentation.
- Treat that atlas as product research, not as a physical schema, API, route,
  test, module-activation, or canonical architecture contract. Preserve
  `Confirmed`, `Derived`, and `Unresolved` distinctions; when the atlas and a
  repository contract address different concerns, map them explicitly instead
  of silently replacing either one.
- Applications may depend on packages; packages never depend on applications
  or own product authorization, tenant, billing, notification, or data rules.
- Routes import bounded-context public entrypoints, never module internals.
- Do not invent authentication, authorization, tenant, invitation, retention,
  billing, notification, or personal-data behavior when the catalog and source
  do not define it.
- Keep changes local, dependency-light, reversible, and separate from unrelated
  cleanup. Preserve existing user work and inspect Git state before mutation.

## Tool workflow

- For operations supported by the Serena JetBrains Plugin, use its
  JetBrains tool before a generic language-server, search, file, or shell
  equivalent. This includes symbols, declarations, implementations, references,
  hierarchies, inspections, debugging, rename, move, inline, and safe delete.
- Use direct file tools for Markdown, JSON, YAML, TOML, exact literal lookup,
  and other non-symbolic content. Use shell tools for builds, tests, Git, and
  system diagnostics. Fall back from JetBrains only after confirming the exact
  project root, plugin connection, and indexing state; narrow the request
  before one retry and report any semantic-verification gap.
- Activate the repository with Serena and read its initial instructions before
  multi-step or material work. Use official Serena memory tools only for
  concise, durable, verified project facts; task state stays in the current
  task unless a checkpoint is explicitly required.
- Use Repomix only for narrow repository snapshots, architecture mapping, or
  cross-file patterns. Start with `includePatterns`, inspect metrics, then grep
  or read exact ranges. Keep security scanning enabled, distrust remote
  configuration, and leave compression off unless its information loss is
  intentional and disclosed.
- Confirm versions before relying on framework, SDK, CLI, or configuration
  behavior. Prefer official version-matched documentation.

## Verification

Run the narrowest discriminating check first, then expand according to risk.
Canonical commands are `pnpm typecheck`, `pnpm lint`, `pnpm architecture`,
`pnpm test`, `pnpm build`, and `pnpm check`. On Windows, use `pnpm.cmd` when
PowerShell blocks the shim.

After changes, inspect diagnostics, references, generated outputs, the actual
diff, `git diff --check`, and untracked files. Report checks that did not run;
never treat an unavailable or timed-out check as passing.
