# Workspace Package Workflow

Scope: `packages/**`. Package architecture is defined by
[`../docs/architecture/architecture.md`](../docs/architecture/architecture.md).

## Delta rules

- Packages provide reusable, business-free technical capabilities. Product
  contexts, tenant policy, authorization, billing, invitations, notifications,
  and application composition remain in `apps/`.
- Before creating or extracting a package, satisfy the canonical
  [package-admission rule](../docs/architecture/architecture.md#workspace-package-admission).
  Package-owned configuration is part of the boundary and cannot select an
  application path.
- A package never imports an application, another package's private source, or
  an undeclared dependency.
- Keep exports explicit and minimal. Consumers use declared package subpaths;
  preserve compatibility or define a migration before changing a public
  contract.
- Add a dependency only when platform and existing workspace capabilities
  cannot meet the need. Avoid overlapping providers.
- Follow the nearest package `AGENTS.md` for its specific contract and focused
  validation.

## Verification delta

Run the affected package's lint, typecheck, and tests first. Export,
dependency, or manifest changes also require workspace architecture validation
and affected-consumer checks.
