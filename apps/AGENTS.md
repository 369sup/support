# Deployable Applications Workflow

This file governs `apps/**` and adds application-level policy to the root
guidance.

## Application boundary

- Each direct child of `apps/` is an independently runnable or deployable
  application with its own manifest, runtime configuration, entrypoints, and
  application tests.
- Add another app only for a distinct deployable runtime or delivery contract.
  A new route, use case, or organizational preference is not sufficient.
- Application code may compose product contexts and workspace packages.
  Workspace packages must not depend on an application.

Code placement and package import rules are owned by
[`docs/architecture/AGENTS.md`](../docs/architecture/AGENTS.md) and
[`packages/AGENTS.md`](../packages/AGENTS.md); do not redefine them here.

## Validation

Run focused commands with `pnpm --filter <app-package> <script>`, then run the
repository gate required by the change.
