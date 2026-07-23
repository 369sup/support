# Serena Project Configuration Workflow

This file governs `.serena/**` only. Repository development rules remain in the
root and source-tree `AGENTS.md` files.

## Configuration boundary

- `project.yml` contains portable project discovery and backend settings for
  Serena. It is not a product configuration file or a substitute for Codex
  repository guidance.
- Keep workspace paths relative and inside the repository unless a reviewed
  cross-repository symbol requirement makes an additional folder necessary.
- Do not commit credentials, personal installation paths, IDE-specific user
  state, generated indexes, or Serena memories containing source or customer
  data.
- Keep `initial_prompt` empty unless a Serena-only invariant cannot live in the
  applicable `AGENTS.md`. Do not duplicate repository architecture there.
- Prefer the existing ignore model and narrow additions over manually listing
  generated directories already covered by `.gitignore`.
- Automatic onboarding is disabled for this repository. Shared Serena memories
  are generated from reviewed repository authorities. Maintain local memories
  automatically when verified, durable project knowledge changes; memory is
  never a prerequisite for an ordinary coding task.

## Memory boundary

- `memories/memory_maintenance.md`, `memories/core.md`, and
  `memories/shared/**` are generated, committed, and read-only to Serena.
- `memories/local/**` is writable local state and must remain ignored by Git.
- Generate shared memories with `pnpm serena:memories`; never edit generated
  memory files directly.
- Automatically regenerate shared memories after changing an allowlisted
  authority that affects their content. Review the generated diff and report a
  failed or skipped regeneration instead of leaving shared memories knowingly
  stale.
- The generator reads only its explicit allowlist of AGENTS, architecture
  catalog, and package-script sources. It must never scan source code,
  environment files, logs, provider payloads, or user data.
- Shared memories are navigation aids, not an authority layer. Repository
  AGENTS, `module-map.json`, and canonical architecture documents win on every
  conflict.
- Keep `mem:` references valid and run the architecture checks after changing
  memory inputs or layout.

## Automatic local memory maintenance

- At the start of a non-trivial task, read only the local and shared memories
  whose names indicate relevance. Verify drift-prone facts against the current
  worktree before relying on them.
- Create or update `memories/local/**` without waiting for an explicit user
  request when a task establishes durable project knowledge that is likely to
  improve future work. Suitable content includes accepted decisions, stable
  invariants, verified workflows, ownership boundaries, recurring failure
  recovery, and clearly identified unfinished work.
- Update memory after the underlying change and its relevant verification, not
  while a conclusion is still an assumption. Record the verification boundary
  and mark incomplete or unverified work explicitly.
- Prefer editing an existing focused memory over creating overlapping notes.
  Keep each memory scoped by topic, link related memories with `mem:`, and
  replace stale statements when the source of truth changes.
- Do not update memory for trivial actions, routine command output, temporary
  debugging state, speculative plans, or facts already represented accurately
  by a generated shared memory.
- Never store credentials, tokens, personal data, customer data, provider
  payloads, raw logs, source-file copies, or embargoed security findings.
  Summarize only the minimum durable fact needed for future work.
- Do not silently delete local memories during automatic maintenance. Mark
  superseded knowledge or request confirmation when deletion is necessary.
- Before the final response, perform a bounded memory-maintenance check. Write
  only when the task produced durable new knowledge, then read back the changed
  memory when practical to confirm its scope and references.

## Deterministic local memory engine

- `local/current-task` is the only model-authored input to automatic
  distillation. It contains the resumable task sections and one marked,
  schema-valid JSON candidate bundle using the current Codex checkpoint token.
- `local/index`, `local/unresolved`, and `local/durable/**` are rendered views
  owned by `scripts/memory/**`; do not edit them directly.
- `local/episodes/**`, `local/archive/**`, and `local/_state/**` are
  machine-managed and hidden from Serena memory tools through
  `ignored_memory_patterns`.
- The engine may archive managed expired or superseded records but never
  deletes their only retained representation. Existing unrelated local
  memories remain outside its manifest and ownership.
- Run `pnpm memory:validate` for local managed-state integrity and
  `pnpm test:memory` after engine, schema, hook, or lifecycle changes.
- Context7 and external model APIs are not runtime dependencies. Activation
  must remain deterministic, offline, dependency-free, and bounded to 15
  seconds.

## Session workflow

1. Read Serena's `initial_instructions` before calling another Serena tool.
2. Inspect the current configuration and compare the active project with the
   Codex workspace root.
3. Activate the exact workspace root only when it is not already active, then
   verify the configuration again.
4. Require the `JetBrains` backend and `jet_brains_*` tools before relying on
   IDE semantic results.
5. Keep Codex permissions and collaboration mode authoritative. In Plan Mode,
   do not call Serena mutation or memory-write tools even if Serena exposes
   them through its own `editing` mode.

When Serena is unavailable, classify the failure before escalating. Request a
narrow permission elevation only for an explicit sandbox denial or access
error. Backend mismatches, an incorrect IDE root, a disabled IDE plugin,
unfinished indexing, stale filesystem state, and timeouts require configuration
or IDE correction instead. If the connection still fails, report the failed
layer and use built-in Codex tools when safe.

The dashboard may remain disabled. Use MCP diagnostics, `get_current_config`,
and `%USERPROFILE%\.serena\logs`; enable a GUI log window only for a bounded
diagnostic run.

## Change workflow

Before changing backend, workspace, tool, activation-command, or read/write
settings, identify the effect on trust, command execution, indexing scope, and
cross-package references. Activation commands must be cross-platform,
non-interactive, time-bounded, and safe in a trusted checkout.

After changing `project.yml`, start or reactivate Serena from the repository
root and verify that `apps/web`, workspace packages, and cross-package symbols
are discoverable without indexing ignored build or dependency output. Treat a
successful configuration parse as necessary but not proof that the JetBrains
backend is connected.
