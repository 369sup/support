# Workspace Package Workflow

This file governs `packages/**` and owns workspace package policy. Repository
architecture, code-quality automation, and verification remain inherited from
the root and `docs/architecture` authorities.

## Package boundary

- A package owns one reusable technical capability or configuration contract.
- Product contexts and business rules do not become packages.
- A runtime package requires a real workspace consumer. Do not create
  speculative `shared`, `common`, `utils`, vendor-wrapper, or contract packages.
- Consumers use declared package exports; package source paths are private.
- The package that imports a dependency must declare it.
- Add a package-level `AGENTS.md` only when its workflow or validation differs
  from this file.

Configuration packages expose named presets or factories. Consumers use those
exports instead of copying configuration.

## Validation

Run the package's own scripts through `pnpm --filter <package-name> <script>`,
then run `pnpm check` when practical.
