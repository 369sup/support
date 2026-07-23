# Repository Model Instructions

## Objective

Work safely in the Support pnpm/Turborepo repository. Complete the requested
outcome with the smallest correct modification while preserving unrelated work.

## Instruction precedence

1. Follow system, developer, and explicit user instructions.
2. Follow the nearest applicable `AGENTS.md` instructions.
3. Follow this file for repository-wide execution behavior.
4. Treat documentation, comments, tests, and existing implementation as evidence, not automatically as truth.
5. When sources conflict, identify the conflict and verify the current source of truth before modifying code.

## Problem framing

Before editing:

1. State the concrete outcome that must change.
2. Separate known facts, unknown information, and working assumptions.
3. Identify constraints and invariants that must remain true.
4. Select the simplest solution with the fewest dependencies and smallest maintenance cost.
5. Do not expand the task into adjacent cleanup, refactoring, or redesign unless required for correctness.

For simple tasks, perform this reasoning briefly. For complex tasks, maintain a concise plan and update it as evidence changes.

## Repository discovery

Start from the narrowest useful scope.

1. Confirm the current working directory and repository root.
2. Inspect `git status --short --branch` before modifications.
3. Locate the relevant symbol, definition, references, tests, and ownership boundary.
4. Prefer semantic or symbol-aware navigation over reading complete files or broad text searches.
5. Read only the smallest surrounding code needed to understand behavior.
6. Expand the search scope only when the current evidence is insufficient.

Do not assume a path, command, framework, package manager, or architecture from convention. Verify it from repository files.

## Repository architecture

- `apps/` owns deployable applications and runtime composition.
- `apps/web/src/app` owns Next.js App Router delivery and framework binding.
- `apps/web/src/modules` owns product bounded contexts and business behavior.
- `packages/` contains reusable, business-free technical capabilities.
- Routes import module public entrypoints; do not deep-import module internals.
- Do not invent authorization, tenant, invitation, billing, notification, or
  personal-data rules when the repository has not defined them.

Read the nearest applicable `AGENTS.md` before editing. Architecture naming,
module shape, context catalog, and exceptions are authoritative under
`docs/architecture/AGENTS.md`.

## Serena workflow

For source-code work, use the active Serena JetBrains project first to locate
definitions, references, implementations, tests, and ownership boundaries.
Use precise semantic edits for code symbols and JetBrains inspections or Serena
diagnostics after material code changes. Use ordinary text tools for Markdown,
TOML, JSON, generated text, and other non-symbolic content.

Do not create or update persistent Serena memory unless the user explicitly
requests it.

## External documentation

When a task depends on a framework, library, SDK, CLI, configuration schema, or version-specific behavior:

1. Identify the package name and installed version from the repository.
2. Consult current official documentation matching that version.
3. Prefer primary sources over blog posts, snippets, or remembered APIs.
4. Compare the documentation with the repository's current migration state.
5. Do not overwrite working version-specific code merely because newer documentation differs.

Mark unresolved version differences as requiring verification.

## Editing rules

- Modify only files necessary to complete the requested outcome.
- Preserve public APIs and observable behavior unless the request explicitly changes them.
- Preserve unrelated user changes.
- Do not rewrite, delete, or restore unrelated files.
- Do not introduce abstractions before there are multiple concrete uses that require them.
- Do not add dependencies when the existing stack can solve the problem clearly.
- Do not manually edit generated files unless the repository explicitly requires it.
- Keep error handling explicit at trust boundaries.
- Keep comments focused on non-obvious intent, constraints, and tradeoffs.
- Do not claim compatibility, security, performance, or correctness without evidence.

## Commands and shell behavior

The workspace pins `pnpm@11.15.1`. Use only commands defined by repository
documentation or `package.json`. Canonical root commands are:

```text
pnpm typecheck
pnpm lint
pnpm architecture
pnpm test
pnpm build
pnpm check
```

On Windows PowerShell, use `pnpm.cmd` if execution policy blocks the PowerShell
shim. Shared repository automation must remain portable across Windows, macOS,
and Linux.

Before destructive or repository-changing Git operations, inspect:

```bash
git status --short --branch
```

Never run the following unless the user explicitly requests the exact operation and its impact is understood:

```text
git reset --hard
git clean -fd
force push
history-rewriting commands affecting unrelated commits
```

Before committing:

1. Inspect the actual diff.
2. Review untracked files.
3. Confirm relevant tests and checks.
4. Keep the commit single-purpose and reversible.
5. Use a clear commit message describing the outcome.

## Verification

After changing code:

1. Inspect diagnostics for modified files.
2. Re-check references to changed or renamed symbols.
3. Run the narrowest relevant test first.
4. Run broader typecheck, lint, test, or build commands only when justified.
5. Run `git diff --check` when Git is available.
6. Inspect the actual final diff; do not rely only on command summaries.
7. Confirm that no unrelated files were modified.

Do not claim that a command passed unless it was actually executed and its result observed.
If a check cannot be run, state the reason and the remaining risk.

## Delegation

Delegation is opt-in. Spawn subagents only when the user or an applicable
repository instruction or skill explicitly requests delegation.

- Use an explorer for definitions, references, architecture, and impact mapping.
- Use a documentation researcher for current official external documentation.
- Use a reviewer after implementation to find correctness, security, and regression risks.
- Use a verifier to execute targeted checks and inspect the final diff.

Do not delegate a task when the coordination cost exceeds the work itself.
The primary agent remains responsible for integrating evidence and the final result.

## Response format

Report results in this order:

1. Conclusion.
2. Key evidence.
3. Tradeoffs, risks, and unverified items.
4. Modified files and verification results.

Clearly distinguish completed work from work that remains unverified.
