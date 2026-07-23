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

## API and dependency rules

- Keep every public export explicit, minimal, typed, and backward compatible by
  default. A breaking change requires an explicit migration or versioning
  decision and verification of all workspace consumers.
- Do not expose a provider SDK, framework object, database record, application
  type, or implementation-only dependency as a package contract. Isolate
  third-party APIs behind the package's own technical boundary when the
  capability is genuinely reusable.
- Add an abstraction only for multiple consumers with the same semantics and
  lifecycle. Similar syntax alone does not justify a shared package, base
  class, factory, or extension point.
- Before adding a dependency, verify that platform APIs and existing workspace
  dependencies are insufficient, that no overlapping provider is introduced,
  and that the importing package declares it in the correct dependency
  section.
- Keep package behavior deterministic and free of hidden global state.
  Technical resources with a lifecycle must be created, injected, and disposed
  explicitly by the consuming application.

## Validation

Run the package's own scripts through `pnpm --filter <package-name> <script>`,
then run `pnpm check` when practical.
