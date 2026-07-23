# Contributing

This file is the sole authority for change, commit, review, and merge workflow.
Technical development rules are owned by
[`docs/architecture/architecture.md`](docs/architecture/architecture.md).
Templates and package documentation link to these authorities instead of
restating them.

## Change scope

- State one concrete outcome, affected ownership boundaries, success criteria,
  and behavior that must remain unchanged.
- Keep feature behavior, bug fixes, formatting, renames, dependency upgrades,
  and architecture moves independently reviewable. Do not include unrelated
  cleanup discovered during the task; create a separate tracking item.
- Synchronize the target branch and resolve known conflicts before requesting
  review. Do not submit a branch known to be unmergeable.
- A major framework, React, TypeScript, shadcn, test-runner, or build-tool
  upgrade follows the technical version-governance rule and remains separate
  from feature work.

## Commit discipline

Each commit has one clear, reversible purpose. Implementation, tests,
documentation, and generated outputs belong in the same commit when they serve
that purpose; source and its generated projection are never split. Use an
imperative message that states the outcome, for example
`Enforce exclusive UI dependency providers`.

## Pull request evidence

A pull request states:

- behavior and architecture impact;
- affected trust, authorization, tenant, data, and operational boundaries;
- migrations, compatibility periods, and generated artifacts;
- commands actually run and their observed results;
- checks not run and the remaining risk;
- dependency and supply-chain impact;
- measured performance evidence when performance or client bundle behavior
  changes; and
- rollback or forward-fix steps for authentication, authorization, data model,
  payment, migration, infrastructure, or other high-risk changes.

Breaking public contracts, events, schemas, or package exports require a
versioned migration path, documented steps, and a defined transition period.

## Documentation and merge gate

Update documentation in the same change when a public interface, environment
variable, deployment process, architecture boundary, runbook, or operator
workflow changes.

Run the narrowest discriminating test first and `pnpm check` when practical.
No branch may merge by skipping required type, lint, architecture, or behavior
checks. CI and local commands do not accept new warnings or permanent warning
baselines.
