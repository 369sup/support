# Bounded-Context Development Workflow

This file governs `apps/web/src/modules/**`. Architecture structure and
dependency rules are not defined here.

## Required authorities

Use these canonical sources before adding or moving module code:

- [`docs/architecture/rules.md`](../../../../docs/architecture/rules.md) for
  dependency direction, boundary behavior, and test invariants;
- [`docs/architecture/naming-conventions.md`](../../../../docs/architecture/naming-conventions.md)
  for roles, filenames, imports, and public entrypoints;
- [`docs/architecture/module-template.md`](../../../../docs/architecture/module-template.md)
  for bounded-context shape;
- [`docs/architecture/module-map.json`](../../../../docs/architecture/module-map.json)
  for context identity, status, responsibility, and official sources; and
- [`docs/architecture/exceptions/registry.json`](../../../../docs/architecture/exceptions/registry.json)
  for approved exceptions.

Mechanical architecture checks are authoritative when prose and code drift.

## Context activation workflow

Do not create a source directory for a planned context. To activate one:

1. Define its responsibility, owner, ubiquitous language, upstream and
   downstream relationships, data ownership, and transaction boundary.
2. Record the required official `docs.github.com` product sources in
   `module-map.json` and change the status to `active`.
3. Generate the module map and review the catalog diff.
4. Create only the layers and public entrypoints required by the first real
   use case.
5. Add the context README decisions required by `module-template.md`.

Do not derive GitHub product behavior from model memory, third-party tutorials,
or similarly named source code.

## Implementation workflow

Before coding, state the use case, aggregate or policy owner, invariants,
inputs, result, command/query classification, and required ports. Implement
domain and application behavior before concrete adapters, then expose only the
smallest public surface required by a real consumer. Add tests at the boundary
carrying the risk.

Add `<bounded-context>/AGENTS.md` only when an active context has durable local
terminology, workflow, validation, or an approved exception not expressible by
its README and these inherited authorities. Never copy the common layer rules
into a context file.

## Validation

Run `pnpm typecheck`, `pnpm lint`, `pnpm architecture`, relevant tests, and
`pnpm check` when practical. Inspect the diff for private deep imports,
client/server leaks, copied exceptions, and uncataloged context directories.
