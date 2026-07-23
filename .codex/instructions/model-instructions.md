# Repository Model Instructions

## Objective

Work safely in the Support pnpm/Turborepo repository. Complete the requested
outcome with the smallest correct modification while preserving unrelated work.

## Instruction precedence

1. Follow system, developer, and explicit user instructions.
2. Follow the nearest applicable `AGENTS.md` instructions.
3. Follow this file for repository-wide execution behavior.
4. Treat documentation, comments, tests, memories, and existing implementation
   as evidence, not automatically as truth.
5. When sources conflict, identify the conflict and verify the current source
   of truth before modifying code.

## Problem framing

Before editing:

1. State the concrete outcome that must change.
2. Separate known facts, unknown information, and working assumptions.
3. Identify constraints and invariants that must remain true.
4. Select the simplest solution with the fewest dependencies and smallest
   maintenance cost.
5. Do not expand the task into adjacent cleanup, refactoring, or redesign
   unless required for correctness.

For simple tasks, perform this reasoning briefly. For complex tasks, maintain a
concise plan and update it as evidence changes.

## Repository discovery

Start from the narrowest useful scope.

1. Confirm the current working directory and repository root.
2. Inspect `git status --short --branch` before modifications.
3. Locate the relevant symbol, definition, references, tests, and ownership
   boundary.
4. Prefer semantic or symbol-aware navigation over reading complete files or
   broad text searches.
5. Read only the smallest surrounding code needed to understand behavior.
6. Expand the search scope only when the current evidence is insufficient.

Do not assume a path, command, framework, package manager, or architecture from
convention. Verify it from repository files.

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

## Dependency installation

1. Do not run `pnpm install` merely because the repository uses pnpm or because a new worktree was created.
2. Determine whether the requested task requires execution of workspace dependencies before installing them.
3. Do not install dependencies for repository inspection, documentation changes, Markdown changes, configuration review, Git inspection, architecture analysis, planning, or other tasks that do not execute Node.js workspace tooling.
4. Before installing dependencies, verify whether the required command can already run with the current workspace state.
5. Run `pnpm install --frozen-lockfile` only when all of the following conditions are true:

   * the task requires a repository command that depends on installed packages;
   * the required dependencies are unavailable or unusable;
   * the repository root and `pnpm-lock.yaml` have been verified;
   * installation is within the approved task scope.
6. Do not run `pnpm install` as a speculative fix for an unrelated command failure.
7. Classify a failed command before installing dependencies. Distinguish missing dependencies from source errors, configuration errors, permission failures, environment failures, network failures, and toolchain failures.
8. When dependency installation is unnecessary, proceed without it.
9. When dependency installation cannot be performed, report the blocked validation and remaining risk instead of treating installation as mandatory.
10. Do not modify the lockfile unless the requested change intentionally changes dependency resolution.

## Serena workflow

1. Use the active Serena JetBrains project as the primary navigation and semantic-analysis surface for source-code tasks.
2. Before using another Serena tool, read Serena `initial_instructions`.
3. Verify that Serena is activated on the exact current Git worktree root.
4. Verify that the active backend is JetBrains before relying on symbol, reference, implementation, hierarchy, or diagnostic results.
5. Start from the narrowest relevant symbol, file, module, or ownership boundary.
6. Use Serena symbol tools to locate definitions, declarations, implementations, references, callers, tests, and diagnostics.
7. Do not begin source-code analysis by reading complete large files or scanning the entire repository.
8. Expand the Serena search scope only when the current evidence is insufficient.
9. Read only the smallest surrounding source range required to establish behavior and responsibility.
10. Before modifying a symbol, identify its definition, relevant references, tests, public contract, and ownership boundary.
11. Use semantic edits for source-code symbols when Serena provides a suitable precise operation.
12. Use ordinary text tools for Markdown, TOML, JSON, YAML, generated text, lockfiles, and other non-symbolic content.
13. Do not use Serena memories as an authority for current implementation behavior.
14. When memory content conflicts with source code, repository instructions, architecture authorities, or current diagnostics, treat the memory as stale.
15. After a material source-code change, use Serena diagnostics and reference analysis to check the modified symbols and affected callers.
16. Do not claim semantic completeness when Serena is unavailable, connected to the wrong project, using the wrong backend, or still indexing.
17. When Serena is unavailable, identify the failed layer and use the narrowest safe fallback tool.
18. Do not create broad repository snapshots when exact symbol or reference lookup can answer the question.

## Persistent task memory

1. Maintain the local Serena memory `local/current-task` for every task that is multi-step, crosses files, contains unresolved decisions, or may approach context compaction.
2. Do not create task memory for trivial one-step questions that contain no reusable state.
3. Read `local/current-task` at the beginning of a resumed task before repeating repository discovery.
4. Treat `local/current-task` as a resumable handoff record, not as repository authority.
5. Update `local/current-task` whenever any of the following occurs:

   * the task objective or scope changes;
   * a material architectural or implementation decision is made;
   * a previously stated assumption is confirmed or rejected;
   * a relevant symbol, file, ownership boundary, or dependency is identified;
   * a material edit is completed;
   * validation produces a meaningful result;
   * a blocker, risk, or unresolved question is discovered;
   * a task phase is completed;
   * context compaction is expected;
   * the session is about to stop with unfinished work.
6. Do not record raw chain-of-thought, speculative reasoning, full transcripts, secrets, credentials, personal data, customer data, or large source excerpts.
7. Record only verified facts, explicit assumptions, decisions, constraints, completed work, validation evidence, risks, and remaining actions.
8. Distinguish verified facts, working assumptions, unresolved items, and rejected approaches.
9. Include exact repository-relative paths and symbol names when they are necessary to resume the task.
10. Include commands only when they were actually executed or remain explicitly pending.
11. Include observed command results without claiming that unexecuted checks passed.
12. Replace obsolete task state instead of continually appending duplicated history.
13. Keep `local/current-task` concise enough to read at the start of the next session.
14. Do not create or preserve unmanaged visible local memories. The model owns
    only `local/current-task`; the deterministic engine purges reviewed retired
    legacy inputs or quarantines unknown future local-memory paths.
15. Before context compaction, update `local/current-task` before performing additional non-essential exploration.
16. Before ending an incomplete task, update `local/current-task` with the next concrete action.
17. When the task is fully complete and no follow-up state remains, delete `local/current-task` or replace it with a concise completed-state record according to the applicable memory-maintenance policy.
18. Do not modify generated or read-only shared memories through Serena memory-write tools.
19. Generate shared memories only through `pnpm serena:memories`.
20. Run shared-memory generation only when an authoritative generator input, memory layout, or memory-generation implementation changed.
21. After generating shared memories, inspect the actual diff and run the configured memory-reference integrity check.
22. Shared memories must contain only reviewed repository knowledge from the generator allowlist.
23. Local memories must remain excluded from Git and must not be required for CI or ordinary repository operation.
24. Before exclusive ownership is enabled, use `pnpm memory:migrate` to obtain
    the legacy inventory token, author the reviewed candidate bundle in
    `local/current-task`, then apply the validated purge with
    `pnpm memory:migrate -- --apply`.
25. Never bypass migration or quarantine by directly moving, deleting, or
    rewriting unmanaged local memory files.

## Task checkpoint format

Write `local/current-task` using this structure:

# Current task

## Objective

The exact outcome currently being implemented.

## Scope

Repository paths, symbols, modules, and explicit exclusions.

## Verified facts

Only facts supported by inspected repository state, tool output, or executed validation.

## Assumptions

Assumptions that remain necessary and have not yet been verified.

## Decisions

Material decisions, selected approach, and rejected alternatives when needed to avoid repeating work.

## Completed

Edits, investigation, and validation already completed.

## Current state

The exact point at which work should resume.

## Remaining

Ordered concrete actions that still need to be performed.

## Validation

Commands actually executed and their observed results.

## Risks

Known risks, blocked checks, stale information, and unresolved questions.

## Automatic candidate bundle

When `SessionStart` supplies a checkpoint token, a multi-step or material task
must keep exactly one candidate bundle at the end of `local/current-task`.
Place it between these markers:

````text
<!-- serena-memory-candidates:start -->
```json
{
  "schemaVersion": 1,
  "checkpointToken": "<SessionStart token>",
  "disposition": "no-memory",
  "candidates": []
}
```
<!-- serena-memory-candidates:end -->
````

Use `no-memory` only when the task produced no durable verified knowledge. Use
`distill` with one to eight candidates when durable knowledge changed. Every
candidate requires exactly these fields:

- `kind`: `decision`, `constraint`, `verified-result`, `environment`,
  `workflow`, or `unresolved`
- `scope`: `task`, `worktree`, `repository`, or `environment`
- `subject`: a short stable topic name
- `statement`: one concise verified rule or result
- `status`: `confirmed` or `unresolved`
- `authority`: `canonical`, `user-decision`, `verified-result`,
  `repeated-observation`, or `inference`
- `confidence`: a number from 0 through 1
- `durability`: `episode`, `working`, or `durable`
- `evidence`: zero to six `{ "type", "reference" }` records; evidence types are
  `user-instruction`, `repository-file`, `test-result`, `diagnostic`, and
  `tool-observation`
- `invalidatedBy`: zero to six short revalidation conditions

Canonical candidates require repository-file evidence. Repository-file
references must be repository-relative. Never add unknown fields, timestamps,
IDs, output paths, raw transcripts, prompts, chain-of-thought, logs, tool
output, payloads, secrets, credentials, personal/customer data, or copied source
blocks. Do not edit `local/durable/**`, `local/index`, `local/unresolved`,
`local/episodes/**`, `local/archive/**`, or `local/_state/**` directly; the
deterministic memory engine owns those paths.

## External documentation

When a task depends on a framework, library, SDK, CLI, configuration schema, or
version-specific behavior:

1. Identify the package name and installed version from the repository.
2. Consult current official documentation matching that version.
3. Prefer primary sources over blog posts, snippets, or remembered APIs.
4. Compare the documentation with the repository's current migration state.
5. Do not overwrite working version-specific code merely because newer
   documentation differs.

Mark unresolved version differences as requiring verification. Context7 is a
documentation aid, not a runtime dependency for repository automation.

## Editing rules

- Modify only files necessary to complete the requested outcome.
- Preserve public APIs and observable behavior unless the request explicitly
  changes them.
- Preserve unrelated user changes.
- Do not rewrite, delete, or restore unrelated files.
- Do not introduce abstractions before multiple concrete uses require them.
- Do not add dependencies when the existing stack can solve the problem.
- Do not manually edit generated files unless repository workflow requires it.
- Keep error handling explicit at trust boundaries.
- Keep comments focused on non-obvious intent, constraints, and tradeoffs.
- Do not claim compatibility, security, performance, or correctness without
  evidence.

## Commands and shell behavior

The workspace pins `pnpm@11.15.1`. Use commands defined by repository
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

Before destructive or repository-changing Git operations, inspect
`git status --short --branch`. Never run hard reset, destructive clean, force
push, or history rewriting unless the user explicitly requests the exact
operation and its impact is understood.

Before committing, inspect the diff and untracked files, confirm relevant
checks, and keep the commit single-purpose and reversible.

## Verification

After changing code:

1. Inspect diagnostics for modified files.
2. Re-check references to changed or renamed symbols.
3. Run the narrowest relevant test first.
4. Expand to typecheck, lint, test, or build only when justified.
5. Run `git diff --check` when Git is available.
6. Inspect the actual final diff.
7. Confirm that no unrelated files were modified.

Do not claim that a command passed unless it was executed and its result was
observed. If a check cannot run, state the reason and remaining risk.

## Delegation

Delegation is opt-in. Spawn subagents only when the user or an applicable
repository instruction or skill explicitly requests delegation. The primary
agent remains responsible for integrating evidence and the final result.

## Response format

Report results in this order:

1. Conclusion.
2. Key evidence.
3. Tradeoffs, risks, and unverified items.
4. Modified files and verification results.

Clearly distinguish completed work from work that remains unverified.
