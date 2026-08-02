# Scope policy

Select repository context in this order and stop as soon as the unresolved
question has enough evidence:

1. Explicitly named files.
2. Symbol definitions and direct references.
3. The owning module or package.
4. Adjacent tests and configuration.
5. Named cross-module dependencies.
6. A task-scoped Repomix pack.
7. Repository-wide context only when every narrower level is insufficient.

## Include rules

- Prefer explicit files and narrow directory globs.
- Include ownership guidance, dependency manifests, and tests only when they can
  change the answer.
- Include generated artifacts only when the task is specifically about them.
- Use compression for structural discovery in large repositories, then reopen
  uncompressed original source for implementation details.

## Exclusion floor

Exclude at least:

- `.env`, `.env.*`, credentials, tokens, private keys, certificates, and secret
  directories;
- dependency stores, build outputs, coverage, caches, logs, and temporary files;
- prior Repomix output and generated reference Skills;
- VCS internals and user-specific IDE or agent state;
- unrelated directories that cannot change the current decision.

Inspect repository-specific ignore files before every pack. A passing security
scan does not prove that the selected scope is safe.

## Retained reference rules

When the user requests a retained generated reference:

1. Use a normalized, task-specific name.
2. Record the repository, exact commit, dirty-state caveat, generation time,
   Repomix version, include and exclude patterns, and compression choice.
3. Mark the output generated and non-authoritative.
4. Regenerate it after relevant source or configuration changes.
5. Verify every material conclusion against original files.
6. Keep it out of version control unless the user explicitly requests review and
   publication of the snapshot.
