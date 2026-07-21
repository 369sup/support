# Architecture Documentation Workflow

This file governs `docs/architecture/**` and adds change-control rules for the
repository's architecture contract.

## Authority map

- `rules.md` owns human-readable invariants and stable `ARCH-*` identifiers.
- `naming-conventions.md` owns canonical names, suffixes, and import paths.
- `typescript-clarity.md` owns TypeScript readability and exception policy.
- `module-template.md` owns the permitted bounded-context shape.
- `module-map.json` is the machine-readable context catalog.
- `module-map.md` is generated from `module-map.json`; never edit it directly.
- `exceptions/registry.json` is the only architecture exception registry.

`AGENTS.md` files may explain workflow and local ownership, but they must not
redefine these contracts. Update the canonical document, the mechanical check,
and its positive and negative fixtures together when an enforceable rule
changes.

## Catalog and exception changes

- Do not activate a bounded context without a defined responsibility and the
  required official GitHub documentation sources.
- Do not create source directories for a `planned` context.
- Give each exception one stable ID, the narrowest scope, a concrete reason,
  an owner, and a removal condition. An exception is not a reusable example.
- Regenerate the Markdown catalog with `pnpm architecture:docs` after changing
  `module-map.json`, then inspect the generated diff.

## Validation

Run:

```text
pnpm architecture:docs
pnpm architecture
pnpm test:architecture
```

Finish by confirming generated documentation is current and no rule ID or
exception reference is orphaned.
